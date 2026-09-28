import "./styles/reset.css";
import "./styles/global.css";
import "./styles/variables.css";

import "./components/navbar/navbar.css";
import "./components/footer/footer.css";

import { renderNavbar } from "./components/navbar/navbar";
import { renderFooter } from "./components/footer/footer";
import { renderizarFAQ } from "./components/faq/faq";


function markActiveLink(): void {
  const normalize = (path: string): string =>
    path.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';

  const current = normalize(location.pathname);

  document
    .querySelectorAll<HTMLAnchorElement>('.navbar__link a')
    .forEach((link) => {
      const href = normalize(new URL(link.href, location.origin).pathname);

      if (href === current) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
}

renderNavbar();
markActiveLink();
renderFooter();
renderizarFAQ();