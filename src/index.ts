
import { app } from "./app";
import connectDB from "./db/connect.db";
import { availableParallelism } from 'os';
import process from 'process';
import cluster from 'cluster';


const numCPUs = availableParallelism();
const PORT = process.env.PORT || 8000;


console.log("CPUS: ",numCPUs);
// if (cluster.isPrimary) {
//     console.log(`Primary ${process.pid} is running`);
//     for (let i = 0; i < 4; i++) {
//       cluster.fork();
//     }
//     cluster.on('exit', (worker, code, signal) => {
//       console.log(`worker ${worker.process.pid} died`);
//     });
// }
// else{
//     connectDB()
//     .then(() => {
//       app.listen(PORT, () => {
//         console.log(` Worker ${process.pid} running on PORT: ${PORT}`);
//       });
//     })
//     .catch((err) => {
//       console.error(" Error running server", err);
//     });
    
// }
































connectDB()
.then(()=>{
    app.listen(PORT, () => {
        console.log(` Worker ${process.pid} running on PORT: ${PORT}`);
      });
    })
.catch((err)=>{
    console.log("Error running server ",err)
})

