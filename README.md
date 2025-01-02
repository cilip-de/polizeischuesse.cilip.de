# [`polizeischuesse.cilip.de`](https://polizeischuesse.cilip.de)

Documenting and visualizing fatal police shootings in Germany.

## Installation and usage

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

```bash
git clone git@github.com:cilip-de/polizeischuesse.cilip.de.git && cd polizeischuesse.cilip.de
npm install
npm run dev
```

You need to have in instance of <https://github.com/beyondopen/geocode-cache-service> running to geocode locations. Set the appropiate env variables below (user, pw, host).

## Environment variables

```bash
GEO_USER=x
GEO_PW=x
GEO_HOST=x

# For the contact form to send emails
EMAIL_SENDER=x@jx.x
EMAIL_PW=x
EMAIL_HOST=x
EMAIL_RECIPIENTS="x <x@x.org>, x x <x@x.de>"

# https://sentry.io
SENTRY_DSN=x
```

## Deployment

You may use [Dokku](https://github.com/dokku/dokku) to deploy this app without further adaption (besides setting the envs).
Otherwise, follow the [Next.js docs](https://nextjs.org/docs/deployment) to, e.g., host on Vercel.

## License for data

The data is published under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) license. Publications should cite "Bürgerrechte & Polizei/CILIP" as the source and link to polizeischuesse.cilip.de.

German: Die Daten sind unter der [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.de) Lizenz veröffentlicht. Veröffentlichungen sollten als Quelle "Bürgerrechte & Polizei/CILIP" angeben und auf polizeischuesse.cilip.de verlinken.

## License

Affero General Public License 3.0
