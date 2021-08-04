import React from 'react';
import { default as Layout, Wrapper, Loading } from './components/layout';
import * as Tasks from './components/tasks';
import * as CONTAINER from './container/index';
import ToolBar from './components/toolbar'
import { use_runtime } from './runtime/index'
import { Dimensions } from './runtime/interfaces';
import ReactLoaderSpinner from 'react-loader-spinner';
import './App.css';

const Page = () => {
  const runtime = use_runtime();
  const {
    task,
    queries,
    constants
  } = runtime;
  const Task = Tasks.use_router({ task });
  const successfully_mined = String(queries.params.pending_tx_success) === 'true';
  const pending_tx_ui = (
    <div onClick={() => window.open(CONTAINER.get_etherscan_base(runtime) + '/tx/' + queries.params.pending_tx, '_blank')} style={{
      cursor: 'pointer',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      width: '100%',
      borderRadius: 9,
      marginTop: 20,
      backgroundColor: 'rgba(0, 0, 0, .15)',
      position: 'relative',
      borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255, 255, 255, .5)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%',
        margin: 20
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <p style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: successfully_mined ? constants.colors.background : 'rgba(255, 255, 255, 1)',
            fontFamily: 'arial',
            margin: 0, padding: 0,
            marginBottom: 15
          }}>{
            `Working on function: ${queries.params.pending_tx_method}` 
          }</p>
          <p style={{
            margin: 0, padding: 0,
            color: 'rgba(255, 255, 255, .9)',
            fontFamily: 'arial',
            fontSize: 13,
            textDecoration: 'underline'
          }}>View on Etherscan.io</p>
        </div>
        <div style={{
          display: 'flex',
          marginRight: 15
        }}>
          <ReactLoaderSpinner
            type="Oval"
            secondaryColor={constants.colors.card}
            color={constants.colors.card}
            height={30}
            width={30}
          />
          
        </div>
      </div>
    </div>
  );
  const successful_tx_ui = (
    <div onClick={() => window.open(CONTAINER.get_etherscan_base(runtime) + '/tx/' + queries.params.successful_tx, '_blank')} style={{
      cursor: 'pointer',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      width: '100%',
      borderRadius: 9,
      marginTop: 20,
      backgroundColor: 'white',
      position: 'relative',
      borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255, 255, 255, .5)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%',
        margin: 20
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <p style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: constants.colors.background,
            fontFamily: 'arial',
            margin: 0, padding: 0,
            marginBottom: 15
          }}>{`Confirmed function: ${queries.params.successful_tx_method}`}</p>
          <p style={{
            margin: 0, padding: 0,
            color: constants.colors.background,
            fontFamily: 'arial',
            fontSize: 13,
            textDecoration: 'underline'
          }}>View on Etherscan.io</p>
        </div>
      </div>
    </div>
  );
  return(
    <>
      <ToolBar />
      <Task pending_tx={queries.params.pending_tx ? pending_tx_ui : (
        queries.params.successful_tx ? successful_tx_ui : null
      )}/>
    </>
  )
};

const NotDeployedYet = () => {
  const {
    dimensions,
    settings
  } = use_runtime();
  return(
    <Wrapper 
      dimensions={dimensions} 
      on_click={() => settings.set(false)} 
      message={'The network you are trying to connect to is not live yet.'}/>
  )
};

const TryDiffNetwork = () => {
  const {
    dimensions,
    settings,
    ethereum
  } = use_runtime();
  return(
    <Wrapper 
      dimensions={dimensions} 
      on_click={() => settings.set(false)} 
      message={'You must connect to the following network: ' + ethereum.connected_network.expects}/>
  )
};

function App(props: { dimensions: Dimensions }) {
  const runtime = use_runtime();
  if (!runtime) {
    return null;
  }
  const { ethereum } = runtime;
  if (ethereum.page_loading) {
    return <Loading />;
  }
  if (!ethereum.connection_loading && ethereum.connected_network.name !== ethereum.connected_network.expects) {
    return <TryDiffNetwork />;
  }
  if (!ethereum.connection_loading && !ethereum.connected_network.name) {
    return <NotDeployedYet />;
  }
  return (
    <Layout >
      <Page />
    </Layout>
  );
}

export default App;
