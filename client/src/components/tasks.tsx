import React, { useEffect, useState } from 'react';
import { use_runtime } from '../runtime/index';
import * as CONTAINER from '../container/index';
import { Runtime } from '../runtime/interfaces';
import { ethers } from 'ethers';
import ReactLoaderSpinner from 'react-loader-spinner';
import CloseIcon from './close-icon.svg';
import RefreshIcon from './refresh-icon.svg';

export const use_router = (options: Pick<Runtime, 'task'>) => {
  switch (options.task.action) {
    case 'confirm_withdrawal':
      return ConfirmWithdrawal;
    case 'increase_stake':
      return IncreaseStake;
    case 'loading':
      return Loading;
    default:
      return DefaultTask;
  }
}

const Card = (props: { children: React.ReactNode, on_close: Function, style?: any }) => {
  const {
    constants
  } = use_runtime();
  return (
    <div style={Object.assign({}, {
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 10,
      position: 'relative',
      backgroundColor: constants.colors.card,
      boxShadow: '0 3px 3px rgba(0,0,0,0.2)'
    }, props.style)}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        margin: 15
      }}>
        <div onClick={(e) => props.on_close(e)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'absolute',
          width: 40,
          height: 40,
          top: -10,
          right: -10,
          borderRadius: 20,
          backgroundColor: constants.colors.card,
          boxShadow: '0 3px 3px rgba(0,0,0,0.2)',
          cursor: 'pointer'
        }}>
          <img style={{
            height: 14,
            margin: 0,
            padding: 0,
            opacity: .7
          }} src={CloseIcon} alt="logo" />
        </div>
        {props.children}
      </div>
    </div>
  );
};

export const ConfirmWithdrawal = (props: { pending_tx: React.ReactNode }) => {
  const runtime = use_runtime();
  const {
    task,
    constants,
    account,
    validators,
    reth_collateral
  } = runtime;
  const [stake_to_withdraw, setStakeToWithdraw] = useState('0');
  const valid_number = isNaN(Number(stake_to_withdraw)) ? 0 : Number(stake_to_withdraw);
  useEffect(() => {
    reth_collateral.reload();
  }, []);
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: '100%',
      height: '100%'
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column',
      }}>
        <Card style={{
          width: 500
        }} on_close={() => task.set('', [])}>
          <>
            <div style={{
              display: 'flex', flexDirection: 'column',
              width: '100%'
            }}>
              <form onSubmit={e => { e.preventDefault(); }} style={{
                margin: 0,
                padding: 0,
                display: 'flex', flexDirection: 'column',
                marginBottom: 15
              }}>
                <label style={{
                  lineHeight: 1.4,
                  margin: 0,
                  padding: 0,
                  color: 'rgba(0, 0, 0, .6)',
                  fontSize: 14,
                  marginBottom: 10
                }} htmlFor="withdraw_stake">
                  {(
                    account.staker.staked_eth <= reth_collateral.total ? `Withdraw up to ${account.staker.staked_eth} ETH` : `Withdraw max of ${reth_collateral.total.toFixed(3)}/${account.staker.staked_eth.toFixed(3)} ETH (rETH collateral is limited right now)`
                  )}
                </label>
                <input value={stake_to_withdraw} onChange={e => setStakeToWithdraw(e.target.value)} style={{
                  margin: 0,
                  padding: 10,
                  borderWidth: 0,
                  borderRadius: 5,
                  color: 'rgba(0, 0, 0, .65)',
                  backgroundColor: (valid_number === 0 || validators.is_valid_stake_to_withdraw(ethers.utils.parseEther(String(valid_number)))) ? 'white' : 'rgba(160, 80, 80, .4)',
                  fontSize: 16
                }} type="text" name="owner" id="owner" />
              </form>
            </div>
            <div onClick={() => CONTAINER.withdraw_stake({
              stake_to_withdraw: valid_number,
              runtime
            })} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              width: '100%',
              height: 40,
              backgroundColor: constants.colors.button,
              borderRadius: 4,
              cursor: 'pointer',
              boxShadow: '0 3px 3px rgba(0,0,0,0.1)'
            }}>
              <h3
                style={{
                  margin: 0,
                  padding: 0,
                  color: 'white',
                  fontSize: 15,
                  fontFamily: 'arial'
                }}>
                {'Complete Withdraw'}
              </h3>
            </div>
          </>
        </Card>
        <div style={{ display: 'flex', width: 500 }}>
          {props.pending_tx}
        </div>
      </div>
    </div>
  );
};

export const IncreaseStake = (props: { pending_tx: React.ReactNode }) => {
  const runtime = use_runtime();
  const {
    task,
    constants,
    validators
  } = runtime;
  const [increase_stake_total, setIncreaseStakeTotal] = useState('0');
  const valid_number = isNaN(Number(increase_stake_total)) ? 0 : Number(increase_stake_total);
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: '100%',
      height: '100%'
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column',
      }}>
        <Card style={{
          width: 500
        }} on_close={() => task.set('', [])}>
          <>
            <div style={{
              display: 'flex', flexDirection: 'column'
            }}>
              <form onSubmit={e => { e.preventDefault(); }} style={{
                margin: 0,
                padding: 0,
                display: 'flex', flexDirection: 'column',
                marginBottom: 15,
              }}>
                <label style={{
                  lineHeight: 1.4,
                  margin: 0,
                  padding: 0,
                  color: 'rgba(0, 0, 0, .6)',
                  fontSize: 14,
                  marginBottom: 10
                }} htmlFor="increase_stake">Enter the amount of ETH that you would like to add to your stake:</label>
                <input value={increase_stake_total} onChange={e => setIncreaseStakeTotal(e.target.value)} style={{
                  margin: 0,
                  padding: 10,
                  borderWidth: 0,
                  borderRadius: 5,
                  color: 'rgba(0, 0, 0, .65)',
                  backgroundColor: (valid_number === 0 || validators.is_valid_increase_stake_total(ethers.utils.parseEther(String(valid_number)))) ? 'white' : 'rgba(160, 80, 80, .4)',
                  fontSize: 16
                }} type="text" name="owner" id="owner" />
              </form>
            </div>
            <div onClick={() => CONTAINER.increase_stake({
              runtime,
              increase_stake_total: Number(increase_stake_total)
            })} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              width: '100%',
              height: 40,
              backgroundColor: constants.colors.button,
              borderRadius: 4,
              cursor: 'pointer',
              boxShadow: '0 3px 3px rgba(0,0,0,0.1)'
            }}>
              <h3
                style={{
                  margin: 0,
                  padding: 0,
                  color: 'white',
                  fontSize: 15,
                  fontFamily: 'arial'
                }}>
                Increase Stake
              </h3>
            </div>
          </>
        </Card>
        <div style={{ display: 'flex', width: 500 }}>
          {props.pending_tx}
        </div>
      </div>
    </div>
  );
};

export const Loading = (props: any) => {
  const {
    constants
  } = use_runtime();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: '100%',
      height: '100%'
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 60,
          borderRadius: 15,
          backgroundColor: constants.colors.card,
          position: 'relative'
        }}>
          <ReactLoaderSpinner
            type="Oval"
            secondaryColor={constants.colors.button}
            color={constants.colors.button}
            height={40}
            width={40}
          />
        </div>
      </div>
    </div>
  );
};

export const DefaultTask = (props: any) => {
  const runtime = use_runtime();
  const {
    constants,
    task,
    account
  } = runtime;
  const width = account.staker.withdrawals_allowed ? 520 : 700;
  const height = 165;
  const button_section_height = 70;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: '100%',
      height: '100%',
      paddingBottom: 100
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: width,
          height: height,
          borderRadius: 12,
          backgroundColor: constants.colors.card,
          position: 'relative',
          boxShadow: '0 3px 3px rgba(0,0,0,0.2)'
        }}>
          <div onClick={async (e) => { await account.reload(); }} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'absolute',
            zIndex: 1000,
            width: 40,
            height: 40,
            top: -10,
            right: -10,
            borderRadius: 20,
            backgroundColor: constants.colors.card,
            boxShadow: '0 3px 3px rgba(0,0,0,0.2)',
            cursor: 'pointer'
          }}>
            <img style={{
              height: 17,
              margin: 0,
              padding: 0,
              opacity: .7
            }} src={RefreshIcon} alt="logo" />
          </div>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            width: width,
            height: height - button_section_height,
            position: 'absolute',
            left: 0,
            top: 0
          }}>
            <div style={{
              display: 'flex',
              width: width,
              height: height - button_section_height,
            }}>
              <div style={{
                display: 'flex',
                position: 'relative',
                width: width,
                height: height - button_section_height,
              }}>
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  position: 'absolute',
                  width: width,
                  height: height - button_section_height,
                  left: 0
                }}>
                  <h3
                    style={{
                      margin: 0,
                      padding: 0,
                      color: 'rgba(0, 0, 0, .6)',
                      fontSize: 24,
                      fontFamily: 'arial'
                    }}>
                    {account.staker.staked_eth} ETH
                  </h3>
                  <p style={{ margin: 0, marginTop: 5, fontSize: 14, color: 'rgba(0, 0, 0, .4)' }}>earning interest on RocketStake</p>
                </div>
              </div>
              
            </div>
          </div>
          <div style={{
            display: 'flex',
            width: width,
            height: button_section_height,
            borderWidth: 0, borderTopWidth: 1, borderStyle: 'solid', borderColor: 'rgba(0, 0, 0, .15)',
            position: 'absolute',
            left: 0,
            bottom: 0
          }}>
            <div style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              padding: 15,
            }}>
              <div onClick={() => task.set('increase_stake', [])} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                width: (width - 40) / 2,
                height: button_section_height - 30,
                backgroundColor: constants.colors.button,
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: '0 3px 3px rgba(0,0,0,0.1)'
              }}>
                <h3
                  style={{
                    margin: 0,
                    padding: 0,
                    color: 'white',
                    fontSize: 15,
                    fontFamily: 'arial'
                  }}>
                  Increase Stake
                </h3>
              </div>
              {account.staker.withdrawals_allowed ? (
                <div onClick={() => task.set('confirm_withdrawal', [])} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  width: (width - 40) / 2,
                  height: button_section_height - 30,
                  marginLeft: 15,
                  backgroundColor: constants.colors.button,
                  borderRadius: 4,
                  cursor: 'pointer',
                  boxShadow: '0 3px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3
                    style={{
                      margin: 0,
                      padding: 0,
                      color: 'white',
                      fontSize: 15,
                      fontFamily: 'arial'
                    }}>
                    Withdraw
                  </h3>
                </div>
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  width: (width - 40) / 2,
                  height: button_section_height - 30,
                  marginLeft: 15,
                  backgroundColor: 'rgba(180, 180, 180, 1)',
                  borderRadius: 4,
                  cursor: 'not-allowed',
                  boxShadow: '0 3px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3
                    style={{
                      margin: 0,
                      padding: 0,
                      color: 'rgba(0, 0, 0, .6)',
                      fontSize: 13,
                      fontFamily: 'arial'
                    }}>
                    Withdrawals Allowed in: {account.staker.blocks_until_withdrawals_allowed} Blocks
                  </h3>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', width }}>
        {props.pending_tx}
      </div>
    </div>
  );
};

