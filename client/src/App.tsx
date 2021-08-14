import React from 'react';
import { default as Layout, Wrapper, Loading } from './components/layout';
import * as Tasks from './components/tasks';
import ToolBar from './components/toolbar';
import PastTransactions from './components/past-transactions';
import { use_runtime } from './runtime/index'
import { Dimensions } from './runtime/interfaces';
import './App.css';

const Page = () => {
    const runtime = use_runtime();
    const {
        task
    } = runtime;
    const Task = Tasks.use_router({ task });
    return (
        <>
            <ToolBar />
            <Task past_transactions_ui={<PastTransactions />} />
        </>
    )
};

const NotDeployedYet = () => {
    const {
        dimensions,
        settings
    } = use_runtime();
    return (
        <Wrapper
            dimensions={dimensions}
            on_click={() => settings.set(false)}
            message={'The network you are trying to connect to is not live yet.'} />
    )
};

const TryDiffNetwork = () => {
    const {
        dimensions,
        settings,
        ethereum
    } = use_runtime();
    return (
        <Wrapper
            dimensions={dimensions}
            on_click={() => settings.set(false)}
            message={'You must connect to the following network: ' + ethereum.connected_network.expects} />
    )
};

function App(props: { dimensions: Dimensions }) {
    const runtime = use_runtime();
    if (!runtime) {
        return null;
    }
    const { ethereum, hardhat } = runtime;
    const not_deployed = String(hardhat) === 'null' || Object.keys(hardhat).length === 0;
    if (ethereum.page_loading) {
        return <Loading />;
    }
    if (!ethereum.connection_loading && ethereum.connected_network.name !== ethereum.connected_network.expects) {
        return <TryDiffNetwork />;
    }
    if ((!ethereum.connection_loading && !ethereum.connected_network.name) || not_deployed) {
        return <NotDeployedYet />;
    }
    return (
        <Layout >
            <Page />
        </Layout>
    );
}

export default App;
