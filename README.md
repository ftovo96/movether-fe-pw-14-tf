Questo è il repository lato frontend del progetto.

Per avviarlo è necessario aver installato [Node.js](https://nodejs.org/en) v18.18 o successiva.
Per l'installazione e gestione delle versioni di node.js è consigliato l'uso di [nvm](https://github.com/nvm-sh/nvm) (MacOS/Linux) o di [nvm-windows](https://github.com/coreybutler/nvm-windows) (Windows).
Il frontend del progetto è stato realizzato con Next.js, di cui si trovano le varie informazioni (in inglese) in fondo a questo file.

## Struttura del progetto

Nella cartella app/ si trovano i file del frontend, nello specifico:
* Le cartelle login/ e register/ contenti le pagine per effettuare l'accesso e/o la registrazione al sistema
* La cartella main/ contenente a sua volta le cartelle contenenti le pagine relative alle attività, prenotazioni e premi
* La cartella models/ contente la definizione delle entità del progetto
* La cartella providers/ contentente i "servizi" del progetto (gestore autenticazione e prenotazioni "anonime").

Per altre informazioni sul progetto (Casi d'uso, Diagramma ER, Documentazione API, ecc...) fare riferimento alla cartella Documentazione/ nel repository del backend.


# README Next.js

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
