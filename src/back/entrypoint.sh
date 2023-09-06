#!/bin/bash
sleep 6
set -m

npx prisma migrate dev --name init &
# npx prisma migrate deploy &
npm run start:prod &
npx prisma studio

fg %1