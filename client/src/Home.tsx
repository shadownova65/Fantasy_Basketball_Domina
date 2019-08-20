import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
import {IUser} from './interfaces';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LeagueInfo from './components/LeagueInfo';
import Matchup from './components/Matchup';
import Rivals from './components/Rivals';
import Playground from './components/Playground';

import {ILeague} from './interfaces';

interface IProps {
  user: IUser
}

const Home: React.FC<IProps> = (props: IProps) => {
  const [user, setUser] = useState<IUser>({} as IUser);
  const [leagues, setLeauges] = useState<ILeague[]>([] as ILeague[]);
  const [leagueIndex, setLeagueIndex] = useState(0);
  const statName = {
    5: "FG%",
    8: "FT%",
    10: "3PTM",
    12: "PTS",
    15: "REB",
    16: "AST",
    17: "ST",
    18: "BLK",
    19: "TO",
    9004003: "FGM/A",
    9007006: "FTM/A"
  }
  useEffect(() => {
    //* get or create user in DB, passed
    let userInput = {
      yahooId: props.user.yahooId,
      name: props.user.name,
      avatar: props.user.avatar
    }
    
    let body = {
      query: `mutation createUser($input: UserInput) {
        createUser(userInput: $input) {
          _id
          name
          yahooId
          avatar
        }
      }`,
      variables: {
        input: userInput
      }
    }
    let options = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    console.log('ready to create user from graphql');
    axios.post('/graphql', body, options).then(response => {
      console.log('checking user with db, return', response.data.data);
    }).catch(err => {console.log('error: checking database: ', err);})
  }, [])

  useEffect(() => {
    //*Queries:
    // 1. get user's leagues in recent 2 seasons
    let body = {
      query: `query leagues($token: String) {
        leagues(token: $token) {
          key
          name
          logo
          totalWeeks
          week
          season
        }
      }`,
      variables: {
        token: props.user.accessToken
      }
    }

    let options = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    console.log('ready to get leagues for user from graphql');
    axios.post('/graphql', body, options).then(response => {
      console.log('get user leagues from api', response.data.data.leagues);
      setLeauges(response.data.data.leagues);
      setLeagueIndex(0);
    }).catch(err => {console.log('error: api getting leagues: ', err);})
  }, [])

  let currentLeague = leagues.length? leagues[leagueIndex] : null;

  return (
    <Router>
      <Header league={currentLeague}/>


      <div className='body'>
        <Sidebar  leagues={leagues} 
                  index={leagueIndex}
                  displayLeague={setLeagueIndex}/>

        <div className="content">
          <Route exact path='/' render={() => (
            <LeagueInfo leagues={leagues} 
                        index={leagueIndex}/>
          )} />
          <Route exact path='/matchup' render={() => (
            <Matchup />
          )} />
          <Route exact path='/rivals' render={() => (
            <Rivals />
          )} />
          <Route excat path='/playground' render={() => (
            <Playground />
          )} />
  
          {props.user.name}
          {props.user.yahooId}
        </div>
      </div>
    </Router>
  )
}

export default Home;