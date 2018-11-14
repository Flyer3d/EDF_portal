export default function ({ store, redirect, route }) {
  if (!store.getters['login/isLoggedIn']) {
      return redirect('/auth');
  } else {
      const roles = store.getters['login/getRoles'];
      console.log(`Authenticated! Role = ${roles}!!`);
      if (roles.indexOf('web_admin') === -1) {
          return redirect(`/error/403`);
      }
  }
}
