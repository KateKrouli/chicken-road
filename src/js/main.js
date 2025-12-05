const navLinkOpen = document.querySelector('.header__open');
const navLinkClose = document.querySelector('.header__close');
const nav =  document.querySelector('.header__nav');

  navLinkOpen.addEventListener('click', (e) => {
    nav.classList.add('open');
    navLinkClose.classList.add('visible');
    navLinkOpen.classList.add('hidden');
  });

  navLinkClose.addEventListener('click', (e) => {
    nav.classList.remove('open');
    navLinkClose.classList.remove('visible');
    navLinkOpen.classList.remove('hidden');
  });