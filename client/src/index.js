import React from 'react';
import ReactDOM from 'react-dom';
import Entry from './entry';
import report_web_vitals from './report-web-vitals';

ReactDOM.render(
  <Entry />,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: report_web_vitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
report_web_vitals();