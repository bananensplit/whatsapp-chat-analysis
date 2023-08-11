export default class WorkerBuilder extends Worker {
    // constructor(worker) {
    //     console.log("HELLOASDASD");
    //     const code = worker.toString();
    //     console.log(code);
    //     const blob = new Blob([`(${code})()`], { type: "application/javascript" });
    //     // const blob = new Blob([code], { type: "application/javascript" });

    //     return new Worker(URL.createObjectURL(blob), { type: "module" });
    // }
    
    constructor(scriptPath, baseURL) {
        // let hello = new Worker("../calcWorkers/TopWordsUsed.worker.jsx", { type: "module" });
        return new Worker(new URL(scriptPath, baseURL), { type: "module" });
    }
}
