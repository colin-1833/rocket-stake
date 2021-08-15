import React from 'react';
import * as CONTAINER from '../container/index';
import { use_runtime } from '../runtime/index'
import { PastTransaction } from '../runtime/interfaces';
import ReactLoaderSpinner from 'react-loader-spinner';
import pretty_ms from 'pretty-ms';

function PendingTransactions(props: any) {
    const runtime = use_runtime();
    const {
        ethereum,
        constants,
        hardhat
    } = runtime;
    const {
        connected_address,
        past_transactions
    } = ethereum;
    const pending_tx_ui = (past_transaction: PastTransaction, i: number) => (
        <div key={i + past_transaction.hash} onClick={() => window.open(CONTAINER.get_etherscan_base(runtime) + '/tx/' + past_transaction.hash, '_blank')} style={{
            cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            width: '100%',
            borderRadius: 9,
            marginTop: 20,
            backgroundColor: 'rgba(255, 255, 255, .6)',
            position: 'relative',
            borderWidth: 1, borderStyle: 'solid', borderColor: constants.colors.background_fade
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
                    }}>{
                            `Working on function: ${past_transaction.method}`
                        }</p>
                    <p style={{
                        margin: 0, padding: 0,
                        color: constants.colors.background,
                        fontFamily: 'arial',
                        fontSize: 13,
                        textDecoration: 'underline'
                    }}>View on Etherscan.io</p>
                </div>
                <div style={{
                    display: 'flex'
                }}>
                    <ReactLoaderSpinner
                        type="Oval"
                        secondaryColor={constants.colors.background}
                        color={constants.colors.background}
                        height={30}
                        width={30}
                    />

                </div>
            </div>
        </div>
    );
    const successful_tx_ui = (past_transaction: PastTransaction, i: number) => (
        <div key={i + past_transaction.hash} onClick={() => window.open(CONTAINER.get_etherscan_base(runtime) + '/tx/' + past_transaction.hash, '_blank')} style={{
            cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            width: '100%',
            borderRadius: 9,
            marginTop: 20,
            backgroundColor: constants.colors.card,
            position: 'relative',
            borderWidth: 1, borderStyle: 'solid', borderColor: constants.colors.background_fade
        }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                width: '100%',
                margin: 20
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                }}>
                    <p style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: constants.colors.background,
                        fontFamily: 'arial',
                        margin: 0, padding: 0,
                        marginBottom: 15
                    }}>{`This transaction succeeded: ${past_transaction.method}`}</p>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        width: '100%',
                    }}>
                        
                        <p style={{
                            margin: 0, padding: 0,
                            color: constants.colors.background,
                            fontFamily: 'arial',
                            fontSize: 13,
                            textDecoration: 'underline'
                        }}>View on Etherscan.io</p>
                        <p style={{
                            margin: 0, padding: 0,
                            color: constants.colors.background,
                            opacity: .7,
                            fontSize: 12
                        }}>
                            {pretty_ms(Date.now() - past_transaction.modified_at, {compact: true}) + ' ago'}
                        </p>
                    </div>
                    
                </div>
            </div>
        </div>
    );
    const failed_tx_ui = (past_transaction: PastTransaction, i: number) => (
        <div key={i + past_transaction.hash} onClick={() => window.open(CONTAINER.get_etherscan_base(runtime) + '/tx/' + past_transaction.hash, '_blank')} style={{
            cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            width: '100%',
            borderRadius: 9,
            marginTop: 20,
            backgroundColor: constants.colors.card,
            position: 'relative',
            borderWidth: 1, borderStyle: 'solid', borderColor: constants.colors.background_fade
        }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                width: '100%',
                margin: 20
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                }}>
                    <p style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: 'rgb(216, 58, 52)',
                        fontFamily: 'arial',
                        margin: 0, padding: 0,
                        marginBottom: 15
                    }}>{`This transaction failed: ${past_transaction.method}`}</p>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        width: '100%',
                    }}>
                        <p style={{
                            margin: 0, padding: 0,
                            color: constants.colors.background,
                            fontFamily: 'arial',
                            fontSize: 13,
                            textDecoration: 'underline'
                        }}>View on Etherscan.io</p>
                        <p style={{
                            margin: 0, padding: 0,
                            color: constants.colors.background,
                            opacity: .7,
                            fontSize: 12
                        }}>
                            {pretty_ms(Date.now() - past_transaction.modified_at, {compact: true}) + ' ago'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
    return(
        <div style={{
            display: 'flex', flexDirection: 'column',
            width: '100%'
        }}>
            {past_transactions.slice().reverse().map((past_transaction, i) => {
                if (past_transaction.status === 'failed') {
                    return failed_tx_ui(past_transaction, i);
                }
                if (past_transaction.status === 'succeeded') {
                    return successful_tx_ui(past_transaction, i);
                }
                if (past_transaction.status === 'pending') {
                    return pending_tx_ui(past_transaction, i);
                }
                return null;
            })}
            <div onClick={() => window.open(CONTAINER.get_etherscan_base(runtime) + '/address/' + hardhat.contracts.RocketStake.address + '?a=' + connected_address, '_blank')} style={{
                cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                width: '100%',
                borderRadius: 9,
                marginTop: 20,
                backgroundColor: 'rgba(0, 0, 0, .15)',
                position: 'relative',
                borderWidth: 1, borderStyle: 'solid', borderColor: constants.colors.background
            }}>
                <div style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    width: '100%'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <p style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: 'rgba(255, 255, 255, 1)',
                            fontFamily: 'arial',
                            marginBottom: 0, marginTop: 0, marginLeft: 0, marginRight: 0, padding: 20,
                            textAlign: 'center'
                        }}>
                            {`View all of your interactions with RocketStake's contract.`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PendingTransactions;
