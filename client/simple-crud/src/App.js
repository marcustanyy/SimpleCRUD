import './App.css';
import { useState, useEffect } from 'react';
import Axios from 'axios';
import randomWords from 'random-words';
import Darkmode from 'darkmode-js';


const NUM_OF_WORDS = 300;
const SECONDS = 60;
let wpm = 0;
let accuracy = 0;

function App() {
  new Darkmode().showWidget();
  const [words, setWords] = useState([]);
  const [countDown, setCountDown] = useState(SECONDS);
  const [currWord, setCurrWord] = useState("");
  const [currWordIdx, setCurretWordIdx] = useState(0);
  const [currChar, setCurrChar] = useState("");
  const [currCharIdx, setCurrCharIdx] = useState(-1);
  const [noOfCorrectWords, setCorrectCounter] = useState(0);
  const [noOfWrongWords, setWrongCounter] = useState(0);
  const [gameState, setGameState] = useState("waiting");
  const [username, setUsername] = useState("Anonymous")

  const [leaderboard, setLeaderboard] = useState([]);


  useEffect(() => {
    setWords(generateWords())
  }, []);

  function generateWords() {
    return new Array(NUM_OF_WORDS).fill(null).map(() => randomWords());
  }

  function startCountDown() {
    if (gameState === "waiting") {
      setGameState("started");
      let interval = setInterval(() => {
        setCountDown((prevCountDown) => {
          if (prevCountDown === 0) {
            clearInterval(interval);
            setGameState("finished");
            setCurrWord("");
            return SECONDS;
          } else {
            return prevCountDown - 1;
          }
        })
      }, 1000);
    }
  }

  function handleKeyStroke({ keyCode, key }) {
    if (keyCode === 32) {
      if (checkWord()) {
        setCorrectCounter(noOfCorrectWords + 1);
        //console.log(noOfCorrectWords);
      } else {
        setWrongCounter(noOfWrongWords + 1);
        //console.log(noOfWrongWords);
      }
      setCurretWordIdx(currWordIdx + 1);
      setCurrWord("");
      setCurrCharIdx(-1);
    } else {
      setCurrCharIdx(currCharIdx + 1);
      setCurrChar(key)
    }
  }

  function checkWord() {
    return words[currWordIdx] === currWord.trim();
  }

  function resetGame() {
    setGameState("waiting");
    setCurretWordIdx(0);
    setCountDown(SECONDS);
    setWords(generateWords());
  }

  function generateHighlight(charIdx, wordIdx, char) {
    if (wordIdx === currWordIdx && charIdx === currCharIdx && currChar) {
      if (char === currChar) {
        return 'has-background-success';
      } else {
        return 'has-background-danger';
      }
    }
  }


  function displayResult() {
    //console.log(noOfCorrectWords);
    accuracy = Math.round(noOfCorrectWords / (noOfCorrectWords + noOfWrongWords) * 100);
    //console.log(accuracy);
    wpm = Math.round(currWordIdx / 100 * accuracy);
  }

  if (gameState === 'finished') {
    displayResult();
  }

  // APIs
  const insertUserResult = () => {
    //console.log("inserting")
    Axios.post('/api/insert', {
      username: username,
      wpm: wpm,
      accuracy: accuracy
    }).then(() => {
      //console.log("Inserted successsfully")
    });
  }

  const getLeaderBoard = () => {
    Axios.get("/api/get").then((response) => {
      //console.log(response);
      setLeaderboard(response.data);
    });
  }

  return (
    <div className="App">
      <div className="section">
        <div className='is-size-1 has-text-centered has-text-primary'>
          <h1>Typing Speed Test</h1>
        </div>
        <div className='is-size-1 has-text-centered' color='black'>
          <h1>{countDown}</h1>
        </div>
      </div>
      <div className='section'>
        <input className='input' type='text' onKeyDown={handleKeyStroke} value={currWord} onChange={(e) => {
          setCurrWord(e.target.value);
          startCountDown();
        }}>
        </input>
      </div>
      <div className='section'>
        <button className='button is-info' onClick={resetGame}>
          Reset
        </button>
      </div>
      <div className="section">
        <div className="card">
          <div className="card-content">
            <>
              {words.map((word, i) => (
                <span key={i}>
                  {word.split("").map((char, index) => (
                    <span className={generateHighlight(index, i, char)} key={index}>{char}</span>
                  ))}
                  <span> </span>
                </span>
              ))}
            </>
          </div>
        </div>
      </div>
      {gameState === 'finished' && (
        <div className='section'>
          <div className='columns'>
            <div className='column'>
              <p className='is-size-5'>Words per Minutes:</p>
              <p className='is-size-1 has-text-primary'> {wpm} </p>
            </div>
            <div className='column'>
              <p className='is-size-5'>Accuracy :</p>
              <p className='has-text-info is-size-1'>{accuracy} %</p>
            </div>
          </div>
          <div className='is-size-4 has-text-centered'>
            <h2>Enter your User ID</h2>
          </div>
          <div className='section'>
            <input className='input' type='text' onChange={(e) => {
              setUsername(e.target.value);
            }}></input>
          </div>
          <div className='section'>
            <button className='button is-info' onClick={insertUserResult}>
              Add Score
            </button>
          </div>
        </div>
      )}
      <div className='section'>
        <button theme="green" onClick={getLeaderBoard}>
          Show leaderboard
        </button>
        <div className='section'>
          <table>
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Username</th>
                <th>WordsPerMin</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((data, index) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{data.username}</td>
                    <td>{data.WordsPerMin}</td>
                    <td>{data.Accuracy}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
