set -e # exit if anything errors

npx webpack --config webpack/webpack.dev.js --watch &
P1=$!

echo "waiting for webpack to output ./dist/index.html, if it doesn't yet exist"
until stat ./dist/index.html >/dev/null 2>&1
do
    echo ...
    sleep 1
done

npx nodemon src/server -e ts --exec 'NODE_ENV=development npx ts-node src/server/server.ts' &
P2=$!

node_modules/open-cli/cli.js http://localhost:3000 &
P3=$!

wait $P1 $P2 $P3
