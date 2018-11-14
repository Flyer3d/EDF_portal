export default function ({ store, redirect, route }) {
  if (!store.getters['login/isLoggedIn']) {
      return redirect('/auth');
  }
}
