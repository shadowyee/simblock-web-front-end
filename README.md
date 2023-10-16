# simblock-web-front-end
the front-end of simblock-web for system development course
## Install

```
git clone https://gitee.com/ink-shadowyee/sim-block-web.git
cd sim-block-web    
npm install                     // you can als use cnpm or yarn

npm run dev                     // run vite

browse http://localhost:3000
```

## Environment(Linux)
```
1. preliminary
sudo apt install nodejs       
sudo apt install npm          
cd <your-project-name>
npm install

2. run
(run it on localhost:)
npm run dev                     // run vite

(if you want to run it on the public/private network:)
npm run build                   // build the project
modify the package.json: "serve": "vite preview --host" (add --host to the "npm run serve" command)
npm run serve                   // run the project on the public/private network
``` 