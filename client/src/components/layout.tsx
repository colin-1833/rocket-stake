import React from 'react';
import { use_runtime } from '../runtime/index';
import ReactNotifyToast from 'react-notify-toast';
import ReactLoaderSpinner from 'react-loader-spinner';
import { Dimensions } from '../runtime/interfaces';
import * as constants from '../runtime/constants/index';

export const Wrapper = (props: { children?: React.ReactNode, message?: string, loading?: React.ReactNode, on_click?: Function, dimensions: Dimensions }) => {
    return (
        <div onClick={() => props.on_click ? props.on_click() : null} style={{
            maxWidth: props.dimensions.width,
            minHeight: props.dimensions.height - 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 200,
            background: `linear-gradient(${constants.colors.background}, ${constants.colors.background_fade})`
        }}>
            <ReactNotifyToast options={{ zIndex: 10, top: '30px' }} />
            {props.children ? props.children : (
                <h1 style={{
                    margin: 0,
                    color: 'white',
                    fontSize: 14,
                    lineHeight: 1.7,
                    width: 470,
                    textAlign: 'center'
                }}>{props.message}</h1>
            )}
        </div>
    );
};

export const Loading = () => {
    const {
        dimensions,
        constants,
        settings
    } = use_runtime();
    return (
        <Wrapper dimensions={dimensions} on_click={() => settings.set(false)}>
            <ReactLoaderSpinner
                type="Oval"
                secondaryColor={constants.colors.card}
                color={constants.colors.card}
                height={40}
                width={40}
            />
        </Wrapper>
    )
}

const Layout = (props: { children: React.ReactNode }) => {
    const {
        dimensions,
        settings
    } = use_runtime();
    if (dimensions.width < 850) {
        return (
            <Wrapper dimensions={dimensions} on_click={() => settings.set(false)}>
                <h1 style={{
                    margin: 0,
                    color: 'white',
                    fontSize: 14
                }}>Please use a desktop to access this site.</h1>
            </Wrapper>
        )
    }
    return (
        <Wrapper dimensions={dimensions} on_click={() => settings.set(false)}>
            {props.children}
        </Wrapper>
    );
}

export default Layout;