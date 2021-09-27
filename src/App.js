import React from 'react';
import logo from './images/ai-logo.png';
import loading from './images/loading.gif';
import error from './images/error.gif';
import warning from './images/warning.gif';
import './App.css';

const _ = require('lodash');

const validateAddress = (a) => {
  /*a.toLowerCase();
  if (a[0] === "r" && a[1] === "o" && a[2] === "n" && a[3] === "i" && a[4] === "n" && a[5] === ":") {
    a = "0x" + a.slice(6);
  }*/

  return (/^(0x){1}[0-9a-fA-F]{40}$/i.test(a));
};

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      loaders: {
        axie: false,
        progress: false,
      },
      axies: [],
      progress: {},
      inputAddress: "",
      apiErrors: false,
      invalidAddress: false,
    };
  }

  resetAndLoad() {
    let loaders = this.state.loaders;
    loaders.axies = true;
    loaders.progress = true;
    this.setState({ loaders:loaders, axies:[], progress:[], apiErrors:false, invalidAddress:false, });
  }

  clearInputAddress() {
    this.refs.inputAddress.value = "";
    this.setState({ inputAddress:"" });
  }

  fetchData() {
    let address = this.state.inputAddress;

    if (address !== "") {
      if (address[0] === "r" && address[1] === "o" && address[2] === "n" && address[3] === "i" && address[4] === "n" && address[5] === ":") {
        address = "0x" + address.slice(6);
      }

      if (!validateAddress(address)) {
        this.resetAndLoad();
        let loaders = this.state.loaders;
        loaders.axies = false;
        loaders.progress = false;
        this.setState({ invalidAddress:true, loaders:loaders });
      } else {
        this.clearInputAddress();
        this.resetAndLoad();

        const headers = {
          "x-rapidapi-host": "axie-infinity.p.rapidapi.com",
          "x-rapidapi-key": process.env.REACT_APP_RAPID_API_KEY
        };

        fetch("https://axie-infinity.p.rapidapi.com/get-axies/"+address, { headers })
        .then(res => res.json())
        .then((result) => {
          let loaders = this.state.loaders;
          let axies = this.state.axies;
          loaders.axies = false;
          this.setState({ loaders:loaders, axies:result.data.axies.results });
          //console.log(this.state.axies);
        })
        .catch((error) => {
          let loaders = this.state.loaders;
          loaders.axies = false;
          this.setState({ loaders:loaders, apiErrors:true });
          //console.log(error);
        });

        fetch("https://axie-infinity.p.rapidapi.com/get-update/"+address, { headers })
        .then(res => res.json())
        .then((result) => {
          let loaders = this.state.loaders;
          let progress = this.state.progress;
          loaders.progress = false;
          this.setState({ loaders:loaders, progress:result });
          //console.log(this.state.progress);
        })
        .catch((error) => {
          let loaders = this.state.loaders;
          loaders.progress = false;
          this.setState({ loaders:loaders, apiErrors:true });
          //console.log(error);
        });
      }
    }
  }

  onChangeAddress(a) {
    let that = this;
    setTimeout(function(){
      that.setState({inputAddress: a.target.value});
    }, 100);
  }

  onKeyDownAddress(a) {
    if (a.key === "Enter") {
      this.fetchData();
    }
  }

  render() {
    let axies = this.state.axies;
    let axieItems;

    if (!_.isEmpty(axies)) {
      axieItems = axies.map((a, i) => {
        return (
          <div key={i} className="col-4 justify-content-center text-center">
            <img className="App-axie-img App-clickable" src={ a.image } /><br/>
            <a href={"https://marketplace.axieinfinity.com/axie/" + a.id} target="_blank" className="btn btn-outline-secondary text-white">More info</a>
          </div>
        );
      });
    }

    return (
      <div>
        <nav className="navbar navbar-expand-sm bg-dark navbar-light justify-content-center">
          <a className="navbar-brand" href="javascript:void(0)">
            <img className="App-logo" src={logo} alt="Logo" />
          </a>
        </nav>
        <div className="container">
          <div className="App-body align-items-center justify-content-center">
            <div className="card bg-dark">
              <div className="card-header text-center text-white">
                <b>Track your progress</b>
              </div>
              <div className="card-body text-center">
                <p className="text-start text-white">Input your address:</p>
                <div className="input-group mb-3">
                  <input ref="inputAddress" type="text" className="form-control bg-dark text-white" placeholder="'0x' or 'ronin:'" onChange={(a) => this.onChangeAddress(a)} onKeyDown={(a) => this.onKeyDownAddress(a)} />
                  <div className="input-group-append">
                    <button className="btn btn-outline-secondary text-white" onClick={() => this.fetchData()}>Track</button>
                  </div>
                </div>
                { (this.state.loaders.axies || this.state.loaders.progress) &&
                  <div className="justify-content-center text-white">
                    <img className="App-header-logo" src={loading} alt="Logo" />
                    <br/>
                    <i>Loading... Just a sec!</i>
                  </div>
                }
                { (this.state.invalidAddress) &&
                  <div className="justify-content-center text-white">
                    <img className="App-header-logo" src={warning} alt="Logo" />
                    <br/>
                    <i>Invalid address!</i><br/>
                    <i>Please double check your input address.</i><br/>
                    <i>Make sure it either starts with "0x" or "ronin:"</i>
                  </div>
                }
                { (this.state.apiErrors) &&
                  <div className="justify-content-center text-white">
                    <img className="App-header-logo" src={error} alt="Logo" />
                    <br/>
                    <i>Oops! There was a problem with the API. Please try again.</i>
                  </div>
                }
              </div>
              { !_.isEmpty(this.state.axies) && !_.isEmpty(this.state.progress) &&
                <>
                  <div className="card-body text-white">
                    <h4 className="card-title text-white text-center">{ this.state.progress.leaderboard.name }</h4>
                    <h5 className="card-title text-white">Stats</h5>
                    <div className="container">
                      <div className="row">
                        <div className="col-4 justify-content-center text-center">
                          <p>Total SLP:</p>
                          <p><b>{ " " + this.state.progress.slp.total }</b></p>
                        </div>
                        <div className="col-4 justify-content-center text-center">
                          <p>MMR:</p>
                          <p><b>{ " " + this.state.progress.leaderboard.elo }</b></p>
                        </div>
                        <div className="col-4 justify-content-center text-center">
                          <p>RANK:</p>
                          <p><b>{ " " + this.state.progress.leaderboard.rank }</b></p>
                        </div>
                      </div>
                    </div>
                    <h5 className="card-title text-white">Axies</h5>
                    <div className="container">
                      <div className="row">
                        { axieItems }
                      </div>
                    </div>
                  </div>
                </>
              }
              <div className="card-footer text-muted text-center">
                Axie GIFs by <a className="App-dev-link" href="https://tenor.com/users/carmircd" target="_blank">@carmircd</a><br/>
                Game & data from <a className="App-dev-link" href="https://axieinfinity.com/" target="_blank">Axie Infinity</a><br/>
                Website designed by <a className="App-dev-link" href="https://github.com/harveyjavier" target="_blank">@harveyjavier</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
