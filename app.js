const tracks = ["kick","snare","hihat","bass"]
const steps = 16

let bpm = 110
let step = 0
let interval = null

const pattern = {}

const audio = new (window.AudioContext || window.webkitAudioContext)()

const samples = {
kick:"https://cdn.jsdelivr.net/gh/jakesgordon/javascript-drum-machine/sounds/kick.wav",
snare:"https://cdn.jsdelivr.net/gh/jakesgordon/javascript-drum-machine/sounds/snare.wav",
hihat:"https://cdn.jsdelivr.net/gh/jakesgordon/javascript-drum-machine/sounds/hihat.wav"
}

const buffers = {}

async function loadSamples(){

for(const key in samples){

const res = await fetch(samples[key])
const arr = await res.arrayBuffer()
buffers[key] = await audio.decodeAudioData(arr)

}

}

function playSample(name){

if(!buffers[name]) return

const src = audio.createBufferSource()
src.buffer = buffers[name]
src.connect(audio.destination)
src.start()

}

function playBass(){

const osc = audio.createOscillator()
const gain = audio.createGain()

osc.type = "sine"
osc.frequency.value = 55

gain.gain.setValueAtTime(1,audio.currentTime)
gain.gain.exponentialRampToValueAtTime(
0.001,
audio.currentTime + 0.4
)

osc.connect(gain)
gain.connect(audio.destination)

osc.start()
osc.stop(audio.currentTime + 0.4)

}

function createGrid(){

const seq = document.getElementById("sequencer")

tracks.forEach(track=>{

pattern[track] = new Array(steps).fill(false)

for(let i=0;i<steps;i++){

const cell = document.createElement("div")
cell.className="cell"

cell.onclick = ()=>{

pattern[track][i] = !pattern[track][i]
cell.classList.toggle("active")

}

seq.appendChild(cell)

}

})

}

function playStep(){

tracks.forEach(track=>{

if(pattern[track][step]){

if(track === "bass"){
playBass()
}else{
playSample(track)
}

}

})

step = (step + 1) % steps

}

async function start(){

if(interval) return

await audio.resume()

const stepTime = (60 / bpm) / 4 * 1000

interval = setInterval(playStep, stepTime)

}

function stop(){

clearInterval(interval)
interval = null

}

function savePattern(){

localStorage.setItem(
"drumPattern",
JSON.stringify(pattern)
)

}

function loadPattern(){

const data = localStorage.getItem("drumPattern")
if(!data) return

const saved = JSON.parse(data)
Object.assign(pattern, saved)

const cells = document.querySelectorAll(".cell")

let index = 0

tracks.forEach(track=>{

saved[track].forEach(val=>{

if(val) cells[index].classList.add("active")

index++

})

})

}

function downloadPattern(){

const data = JSON.stringify(pattern,null,2)

const blob = new Blob([data],{type:"application/json"})

const url = URL.createObjectURL(blob)

const a = document.createElement("a")
a.href = url
a.download = "drum-pattern.json"
a.click()

}

document.getElementById("start").onclick = start
document.getElementById("stop").onclick = stop
document.getElementById("save").onclick = savePattern
document.getElementById("load").onclick = loadPattern
document.getElementById("download").onclick = downloadPattern

document.getElementById("bpm").oninput = e => {

bpm = e.target.value

if(interval){
stop()
start()
}

}

createGrid()
loadSamples()