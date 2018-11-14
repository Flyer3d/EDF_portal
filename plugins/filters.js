import Vue from 'vue';
import moment from 'moment';

Vue.filter('toHours', val => ((val >= 1440) ? Math.floor(val / 1440) + 'д ' + Math.floor((val % 1440) / 60) + 'ч ' +
  (val % 60) + 'м' : Math.floor(val / 60) + 'ч ' + (val % 60) + 'м'));

Vue.filter('toPrice', (num) => {
  let val;
  if (num !== null) {
    val = num.toString();
    return (val.length > 3 ? val.replace(/([0-9]{3}$)/, ' $1') : val) + ' руб.';
  }
  return num;
});

Vue.filter('formatPhone', (phone) => {
  if (!phone) return '';
  return String(phone).replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
});

Vue.filter('withDay', (date) => {
  moment.locale('en');
  return moment(date).format('D.M.YYYY, dddd');
});

Vue.filter('toDate', (date) => {
  moment.locale('en');
    if (isNaN(moment(date))) {
        return date;
    }
    return moment(date).format('DD.MM.YYYY HH.mm');
});

Vue.filter('fromNow', (date) => {
  moment.locale('en');
    if (isNaN(moment(date))) {
        return date;
    }
    return moment(date).fromNow();
});

Vue.filter('fullDate', (date) => {
  moment.locale('en');
    if (isNaN(moment(date))) {
        return date;
    }
    return moment(date).format('D MMMM YYYY');
});

Vue.filter('bigNumber', (num) => {
  if (!num) {
    return num;
  }
  const str = String(num);
  return str.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1\u2009');
});

Vue.filter('clearField', (name) => {
  return name && name.split(':')[0];
});
