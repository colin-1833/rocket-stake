const deployments = require('./index').default;

module.exports = Object.keys(deployments).filter(d => deployments[d].empty !== true);