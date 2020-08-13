set -e # exit if anything errors

./node_modules/.bin/webpack --config webpack/webpack.dev.js --watch &
P1=$!

echo "waiting for webpack to output ./dist/index.html, if it doesn't yet exist"
until stat ./dist/index.html >/dev/null 2>&1
do
    echo ...
    sleep 1
done

NODE_ENV=development node src/server/server.ts &
P2=$!

node_modules/open-cli/cli.js http://localhost:3000 &
P3=$!

wait $P1 $P2 $P3
