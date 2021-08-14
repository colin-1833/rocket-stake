import React from 'react';
import * as CONTAINER from '../container/index';
import { use_runtime } from '../runtime/index'
import { PastTransaction } from '../runtime/interfaces';
import ReactLoaderSpinner from 'react-loader-spinner';


function PendingTransactions(props: any) {
    const runtime = use_runtime();
    const {
        ethereum,
        constants
    } = runtime;
    const {
        past_transactions
    } = ethereum;
    const pending_tx_ui = (past_transaction: PastTransaction, i: number) => (
        <div key={i + past_transaction.hash} onClick={() => window.open(CONTAINER.get_etherscan_base(runtime) + '/tx/' + past_transaction.hash, '_blank')} style={{
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
                        color: 'rgba(255, 255, 255, 1)',
                        fontFamily: 'arial',
                        margin: 0, padding: 0,
                        marginBottom: 15
                    }}>{
                            `Working on function: ${past_transaction.method}`
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
                    display: 'flex'
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
    const successful_tx_ui = (past_transaction: PastTransaction, i: number) => (
        <div key={i + past_transaction.hash} onClick={() => window.open(CONTAINER.get_etherscan_base(runtime) + '/tx/' + past_transaction.hash, '_blank')} style={{
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
                    }}>{`Confirmed function: ${past_transaction.method}`}</p>
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
    const failed_tx_ui = (past_transaction: PastTransaction, i: number) => (
        <div key={i + past_transaction.hash} onClick={() => window.open(CONTAINER.get_etherscan_base(runtime) + '/tx/' + past_transaction.hash, '_blank')} style={{
            cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            width: '100%',
            borderRadius: 9,
            marginTop: 20,
            backgroundColor: constants.colors.error_red,
            position: 'relative'
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
                        color: 'white',
                        fontFamily: 'arial',
                        margin: 0, padding: 0,
                        marginBottom: 15
                    }}>{`Your last transaction failed!`}</p>
                    <p style={{
                        margin: 0, padding: 0,
                        color: 'white',
                        fontFamily: 'arial',
                        fontSize: 13,
                        textDecoration: 'underline'
                    }}>View on Etherscan.io</p>
                </div>
            </div>
        </div>
    );
    return(
        <div style={{
            display: 'flex', flexDirection: 'column',
            width: '100%'
        }}>
            {past_transactions.map((past_transaction, i) => {
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
        </div>
    )
}

export default PendingTransactions;
