pnpm create hyperstack out-blank -t blank
cd out-blank
pnpm i &&  bin/hyperstack g scaffold article title:string body:text && pnpm test -- --ci=false


pnpm create hyperstack out-app -t app
cd out-app
pnpm i && pnpm test -- --ci=false && bin/hyperstack g scaffold article && pnpm test -- --ci=false

