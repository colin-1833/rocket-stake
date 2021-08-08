import React from 'react';
import { use_runtime } from '../runtime/index';
import config from '../config';
import ReactLoaderSpinner from 'react-loader-spinner';
import GithubIcon from './github-icon.svg';

const AddressConnectionControls = (props: { height: number }) => {
    const {
        ethereum,
        constants,
        account
    } = use_runtime();
    const open_etherscan = () => {
        if (ethereum.connected_network.name.toLowerCase() === 'mainnet') {
            window.open('https://etherscan.io/address/' + ethereum.connected_address)
        }
        window.open('https://' + ethereum.connected_network.name.toLowerCase() + '.etherscan.io/address/' + ethereum.connected_address)
    };
    if (!ethereum.connected) {
        return (
            <>
                <div onClick={() => ethereum.dry_connect_metamask()} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    paddingLeft: 15, paddingRight: 15,
                    borderRadius: 5,
                    backgroundColor: constants.colors.success_green,
                    height: props.height,
                    boxShadow: '0 3px 3px rgba(0,0,0,0.2)',
                    cursor: 'pointer'
                }}>
                    <h4
                        style={{
                            margin: 0,
                            padding: 0,
                            color: 'white',
                            fontSize: 14,
                            fontFamily: 'arial'
                        }}>
                        Connect Metamask
                    </h4>
                </div>
            </>
        );
    }
    if (!ethereum.connected_network.correct_subdomain) {
        return (
            <>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    paddingLeft: 15, paddingRight: 15,
                    borderRadius: 5,
                    backgroundColor: constants.colors.error_red,
                    height: props.height,
                    boxShadow: '0 3px 3px rgba(0,0,0,0.2)'
                }}>
                    <h4
                        style={{
                            margin: 0,
                            padding: 0,
                            color: 'white',
                            fontSize: 14,
                            fontFamily: 'arial'
                        }}>
                        Connect Metamask to: {ethereum.connected_network.expects}
                    </h4>
                </div>
            </>
        )
    }
    return (
        <>
            <div onClick={() => open_etherscan()} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                paddingLeft: 15, paddingRight: 15,
                borderRadius: 5,
                backgroundColor: constants.colors.card,
                height: props.height,
                boxShadow: '0 3px 3px rgba(0,0,0,0.2)',
                cursor: 'pointer'
            }}>
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    width: 18,
                    height: 18,
                    backgroundColor: account.loading ? 'transparent' : ethereum.connected_network.color,
                    borderRadius: 9
                }}>
                    {account.loading ? (
                        <ReactLoaderSpinner
                            type="Puff"
                            secondaryColor={constants.colors.card}
                            color={ethereum.connected_network.color}
                            height={18}
                            width={18}
                        />
                    ) : <div />}
                </div>
                <h4
                    style={{
                        margin: 0,
                        padding: 0,
                        marginLeft: 10,
                        color: 'rgba(0, 0, 0, .6)',
                        fontSize: 14,
                        fontFamily: 'arial'
                    }}>
                    {(ethereum.connected_network.name + ' ' + ethereum.connected_address.slice(0, 8) + '...')}
                </h4>
            </div>
        </>
    );
};

const TotalRETHLocked = (props: { height: number }) => {
    const runtime = use_runtime();
    const {
        constants,
        account,
        ethereum
    } = runtime;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 5,
            height: props.height,
            backgroundColor: constants.colors.card,
            boxShadow: '0 3px 3px rgba(0,0,0,0.2)',
            overflow: 'hidden'
        }}>
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
                <h4
                    style={{
                        margin: 0,
                        padding: 0,
                        color: 'rgba(0, 0, 0, .64)',
                        fontSize: 12,
                        fontFamily: 'arial',
                        whiteSpace: 'nowrap',
                        paddingLeft: 15, paddingRight: 10
                    }}>
                    {'Total rETH Staked'}
                </h4>
            </div>
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'white',
                height: '100%',
                paddingLeft: 10, paddingRight: 10,
                borderWidth: 0, borderLeftWidth: 1, borderStyle: 'solid', borderColor: 'rgba(0, 0, 0, .34)',
            }}>
                <h4
                    style={{
                        margin: 0,
                        padding: 0,
                        color: constants.colors.background,
                        fontSize: 15,
                        fontFamily: 'arial',
                        whiteSpace: 'nowrap'
                    }}>
                    {ethereum.connected ? account.total_reth.toFixed(3) : '--'}
                </h4>
            </div>
        </div>
    );
};

const TotalRETHCollateral = (props: { height: number }) => {
    const runtime = use_runtime();
    const {
        constants,
        reth_collateral,
        ethereum
    } = runtime;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 5,
            height: props.height,
            backgroundColor: constants.colors.card,
            boxShadow: '0 3px 3px rgba(0,0,0,0.2)',
            overflow: 'hidden'
        }}>
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
                <h4
                    style={{
                        margin: 0,
                        padding: 0,
                        color: 'rgba(0, 0, 0, .64)',
                        fontSize: 12,
                        fontFamily: 'arial',
                        whiteSpace: 'nowrap',
                        paddingLeft: 15, paddingRight: 10
                    }}>
                    {'RP ETH Collateral'}
                </h4>
            </div>
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'white',
                height: '100%',
                paddingLeft: 10, paddingRight: 10,
                borderWidth: 0, borderLeftWidth: 1, borderStyle: 'solid', borderColor: 'rgba(0, 0, 0, .34)',
            }}>
                <h4
                    style={{
                        margin: 0,
                        padding: 0,
                        color: constants.colors.background,
                        fontSize: 15,
                        fontFamily: 'arial',
                        whiteSpace: 'nowrap'
                    }}>
                    {ethereum.connected ? reth_collateral.total.toFixed(2) : '--'}
                </h4>
            </div>
        </div>
    );
};

const Github = (props: { height: number }) => {
    const {
        constants
    } = use_runtime();
    return (
        <div onClick={(e) => window.open(config.github_url)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 50,
            height: props.height,
            borderRadius: 5,
            backgroundColor: constants.colors.card,
            boxShadow: '0 3px 3px rgba(0,0,0,0.2)',
            cursor: 'pointer'
        }}>
            <img style={{
                height: 23,
                margin: 0,
                padding: 0,
                opacity: .7
            }} src={GithubIcon} alt="logo" />
        </div>
    )
};

const SettingsOption = (props: {
    title: string,
    selected: boolean,
    on_click: Function,
    style?: any
}) => {
    const {
        constants
    } = use_runtime();
    return (
        <>
            <style>{`
        .settings-option-text-hover:hover {
          text-decoration: underline;
        }
      `}</style>
            <div className={'settings-option-text-hover'} onClick={() => props.on_click()} style={Object.assign({}, {
                display: 'flex',
                padding: 15,
                minWidth: 170,
                borderWidth: 0, borderTopWidth: 1, borderStyle: 'solid', borderColor: 'rgba(0, 0, 0, .1)'
            }, props.style)}>
                <div style={{
                    display: 'flex',
                    width: '100%'
                }}>
                    <h4 style={{
                        margin: 0,
                        padding: 0,
                        fontSize: 13,
                        fontWeight: props.selected ? 'bolder' : 'normal',
                        color: props.selected ? constants.colors.background : 'rgba(0, 0, 0, .8)',
                        whiteSpace: 'nowrap'
                    }}>{props.title}</h4>
                </div>
            </div>
        </>
    );
}

const Settings = (props: { height: number }) => {
    const runtime = use_runtime();
    const {
        task,
        constants,
        settings,
    } = runtime;
    return (
        <div onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            settings.set((last_show_menu: boolean) => !last_show_menu)
        }} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            width: 50,
            height: props.height,
            borderRadius: 5,
            backgroundColor: settings.show ? 'rgba(200, 200, 200, .9)' : constants.colors.card,
            boxShadow: '0 3px 3px rgba(0,0,0,0.2)',
            cursor: 'pointer'
        }}>
            {settings.show ? (
                <div onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                }} style={{
                    display: 'flex', flexDirection: 'column',
                    position: 'absolute',
                    top: 51,
                    right: 0,
                    borderRadius: 5,
                    boxShadow: '0 3px 3px rgba(0,0,0,0.2)',
                    backgroundColor: 'white',
                }}>
                    <SettingsOption
                        selected={false}
                        title={'What is RocketStake?'}
                        on_click={() => window.open(`https://github.com/colin-1833/rocket-stake`, '_blank')} />
                    <SettingsOption
                        selected={false}
                        title={'Rocket Pool Docs'}
                        on_click={() => window.open(`https://docs.rocketpool.net/guides/staking/overview.html#how-rocket-pool-works`, '_blank')} />
                </div>
            ) : null}
            <div style={{
                display: 'flex',
                width: 5,
                height: 5,
                borderRadius: 2.5,
                backgroundColor: 'rgba(0, 0, 0, .3)'
            }}>
                <div />
            </div>
            <div style={{
                display: 'flex',
                width: 5,
                height: 5,
                borderRadius: 2.5,
                marginLeft: 3,
                backgroundColor: 'rgba(0, 0, 0, .3)'
            }}>
                <div />
            </div>
            <div style={{
                display: 'flex',
                width: 5,
                height: 5,
                borderRadius: 2.5,
                marginLeft: 3,
                backgroundColor: 'rgba(0, 0, 0, .3)'
            }}>
                <div />
            </div>
        </div>
    );
};

const TitleSection = () => {
    const { dimensions } = use_runtime();
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            width: dimensions.width
        }}>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: dimensions.width
            }}>
                <h1 style={{
                    color: 'white',
                    fontSize: 25,
                    margin: 0, padding: 0,
                    marginTop: 56
                }}>RocketStake</h1>
            </div>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: dimensions.width
            }}>
                <p style={{
                    color: 'white',
                    fontSize: 13,
                    width: dimensions.width < 600 ? 320 : 400,
                    textAlign: 'center',
                    margin: 0, padding: 0,
                    marginTop: 5,
                    lineHeight: 1.4
                }}>A feeless decentralized staking provider that uses <a href="https://www.rocketpool.net/" style={{ textDecoration: 'underline', color: 'white' }} rel="noreferrer" target="_blank">rETH (Rocket Pool)</a> under the hood to generate ETH rewards on your behalf.</p>
            </div>
        </div>
    );
}

const Toolbar = () => {
    const { dimensions, constants } = use_runtime();
    const height = 37;
    return (
        <div style={{
            display: 'flex',
            width: '100%',
            position: 'absolute',
            top: 30,
            left: 0
        }}>
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                width: dimensions.width,
                height: 30,
                marginTop: -30,
                backgroundColor: constants.colors.pending,
                position: 'absolute',
                left: 0, top: 0,
                zIndex: 15,
                boxShadow: '0 3px 3px rgba(0,0,0,0.2)',
            }}>
                <h2 style={{
                    fontSize: 13,
                    color: constants.colors.background,
                    margin: 0, padding: 0,
                    marginTop: -3
                }}>Always confirm the correct address in the url bar and review metamask transactions before submitting!</h2>
            </div>
            <TitleSection />
            <div style={{
                display: 'flex',
                position: 'absolute',
                top: 15,
                left: 15
            }}>
                <TotalRETHLocked height={height} />
                <div style={{
                    display: 'flex',
                    width: 15
                }}>
                    <div />
                </div>
                <TotalRETHCollateral height={height} />
            </div>
            <div style={{
                display: 'flex',
                position: 'absolute',
                top: 15,
                right: 15
            }}>
                <AddressConnectionControls height={height} />
                <div style={{
                    display: 'flex',
                    width: 15
                }}>
                    <div />
                </div>
                {!config.github_url ? null : (
                    <>
                        <Github height={height} />
                    </>
                )}
            </div>
        </div>
    )
};

export default Toolbar;