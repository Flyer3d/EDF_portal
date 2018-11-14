# Портал EDF

> Virtual desktop SPA

## Требования

 - [Node v8+](https://nodejs.org/en/download/current/)
 - [Yarn](https://yarnpkg.com/en/docs/install)
 - [pm2](http://pm2.keymetrics.io/)

## Установка

Клонируем GIT-репозиторий:

```bash
git clone --depth 1 http://gitlab/adapter/web.git -b portal
cd Server
```

Устанавливаем зависимости:

```bash
yarn
```

## Запуск для локальных тестов

```bash
yarn dev
```

## Запуск сервера в Development

```bash
yarn build
yarn pmstart
```

## Запуск сервера в Production

```bash
yarn build
yarn start
```
