console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Step 2 (replaced by Step 3): automatic current page link
// let navLinks = $$('nav a');
// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname,
// );
// currentLink?.classList.add('current');

// Step 3: automatic navigation menu
let pages = [
  { url: '', title: 'Home' },
  { url: 'resume/', title: 'Resume' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contacts/', title: 'Contact' },
  { url: 'https://github.com/MarkBish24', title: 'GitHub' },
];

const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/' // Local server
    : '/DSC106-Lab01/'; // GitHub Pages repo name

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  url = !url.startsWith('http') ? BASE_PATH + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  // Treat "/resume/" and "/resume/index.html" as the same page
  let currentPath = location.pathname.replace(/index\.html$/, '');
  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === currentPath,
  );

  if (a.host !== location.host) {
    a.target = '_blank';
  }

  nav.append(a);
}

// Step 4: dark mode switch
document.body.insertAdjacentHTML(
  'afterbegin',
  `
	<label class="color-scheme">
		Theme:
		<select>
			<option value="light dark">Automatic</option>
			<option value="light">Light</option>
			<option value="dark">Dark</option>
		</select>
	</label>`,
);

let select = document.querySelector('.color-scheme select');

// Show the OS color scheme in the "Automatic" option, e.g. "Automatic (Dark)"
let osIsDark = matchMedia('(prefers-color-scheme: dark)').matches;
select.querySelector('option[value="light dark"]').textContent =
  `Automatic (${osIsDark ? 'Dark' : 'Light'})`;

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
}

if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  setColorScheme(event.target.value);
  localStorage.colorScheme = event.target.value;
});

// Step 5: better contact form
let form = document.querySelector('form');

form?.addEventListener('submit', function (event) {
  event.preventDefault();

  let data = new FormData(form);
  let params = [];

  for (let [name, value] of data) {
    params.push(`${name}=${encodeURIComponent(value)}`);
  }

  let url = form.action + '?' + params.join('&');
  location.href = url;
});

// Lab 4, Step 1.2: fetch and parse JSON data
export async function fetchJSON(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

// Lab 4, Step 1.4: render a list of projects into a container
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!containerElement) {
    console.error('renderProjects: container element not found');
    return;
  }

  const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (!validHeadings.includes(headingLevel)) {
    console.warn(`renderProjects: invalid heading "${headingLevel}", using h2`);
    headingLevel = 'h2';
  }

  containerElement.innerHTML = '';

  if (!Array.isArray(projects) || projects.length === 0) {
    containerElement.innerHTML = '<p>No projects to display yet.</p>';
    return;
  }

  for (let project of projects) {
    const article = document.createElement('article');
    const title = project.title ?? 'Untitled project';
    const image =
      project.image ?? 'https://vis-society.github.io/labs/2/images/empty.svg';
    const description = project.description ?? '';

    article.innerHTML = `
      <${headingLevel}>${title}</${headingLevel}>
      <img src="${image}" alt="${title}">
      <p>${description}</p>
    `;

    containerElement.appendChild(article);
  }
}

// Lab 4, Step 3.2: fetch a user's public GitHub profile data
export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}
