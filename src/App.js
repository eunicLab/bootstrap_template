import React, { PureComponent } from 'react';
import axios from 'axios';
import Chart from 'chart.js';
import classes from './App.css';
import WeightItem from './components/WeightItem.js';
import './App.css';

let myLineChart;
let trackerObjectglobal = [];

export default class LineGraph extends PureComponent {
  chartRef = React.createRef();
  constructor(props) {
    super(props);
    global.email = '';
    global.error = 0;
    global.firstName = '';
    this.state = {
      //login page states
      loginTopActive: true,
      loggedIn: false,
      emailInput: '',
      passwordInput: '',
      firstnameInput: '',
      error: 0,
      loadingImage: 'noDisplay',
      //weight tracker states

      weightArray: [],
      dateArray: [],
      goalArray: [],
      id: '',
      goalDisplay: '',
      weightDisplay: '',

      weightInput: '',
      dateInput: '',
      goalInput: '',

      todos: [],
      username: '',
      data: 0,
      token: '',
      unit: 'None',
      unitInput: '',
      childweight: '',
      childDate: '',
      childIdentifier: '',
      openModalEdit: false,
    };
  }
  //functions for weight tracker

  afterLogin = () => {
    window.$('#myModalLogin').modal('hide');

    if (this.state.loggedIn) {
      axios
        .get('https://warm-inlet-95424.herokuapp.com/api/stuff', {
          params: {
            email: this.state.emailInput.toLowerCase(),
          },
          headers: { Authorization: `Bearer ${this.state.token}` },
        })
        .then((response) => {
          console.log(response.data[0]);
          this.setState({
            id: response.data[0]._id,
            unit: response.data[0].unit,
            goalDisplay: response.data[0].goal,
            goalInput: response.data[0].goal,
            email: this.state.emailInput,
          });
          if (response.data[0].date.length > 0) {
            this.setState({
              todos: response.data[0],
              data: 0,
              weightArray: response.data[0].weight,
              dateArray: response.data[0].date,
              goalArray: new Array(response.data[0].weight.length).fill(
                response.data[0].goal
              ),
            });

            this.buildChart(
              this.state.weightArray,
              this.state.dateArray,
              this.state.goalArray
            );
          }
          if (response.data[0].date.length === 0) {
            this.setState({
              weightArray: [],
              dateArray: [],
            });
          }
        });
    }
  };

  componentDidUpdate = () => {
    if (this.state.data !== 0 || global.checker >= 1) {
      global.checker--;
      this.afterLogin();
      if (!this.state.loggedIn) {
        this.buildChart(
          this.state.weightArray,
          this.state.dateArray,
          new Array(this.state.weightArray.length).fill(this.state.goalInput)
        );
      }
    }
    if (this.state.openModal) {
      window.$('#myModalEdit').modal('show');
    }
  };

  buildChart = (weight, date, goal) => {
    const myChartRef = this.chartRef.current.getContext('2d');

    if (typeof myLineChart !== 'undefined') myLineChart.destroy();

    myLineChart = new Chart(myChartRef, {
      type: 'line',
      data: {
        //Bring in data
        labels: date,
        datasets: [
          {
            label: 'Weight',
            data: weight,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
              'rgba(255, 99, 132, 0.6)',
            ],
          },
          {
            label: 'Goal',
            data: goal,
            backgroundColor: [
              'rgba(54, 162, 235, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 159, 64, 0.6)',
              'rgba(255, 99, 132, 0.6)',
            ],
          },
        ],
      },
      options: {
        //Customize chart options
        responsive: true,
        legend: {
          position: 'bottom',
        },
      },
    });
  };

  handleWeightSubmit = (event) => {
    event.preventDefault();
    if (this.state.weightInput !== '' && this.state.dateInput !== '') {
      let goalArray = this.state.goalArray;
      this.setState({
        goalArray: new Array(goalArray.length + 1).fill(
          this.state.goalArray[this.state.goalArray.length - 1]
        ),
        weightArray: [...this.state.weightArray, this.state.weightInput],
        dateArray: [...this.state.dateArray, this.state.dateInput],
      });
      const upDatedItem = {
        weight: [...this.state.weightArray, this.state.weightInput],
        date: [...this.state.dateArray, this.state.dateInput],
      };
      if (this.state.loggedIn) {
        axios
          .put(
            'https://warm-inlet-95424.herokuapp.com/api/stuff/' + this.state.id,
            upDatedItem,
            {
              headers: {
                Authorization: `Bearer ${this.state.token}`,
              },
            }
          )
          .then((res) => {
            this.afterLogin();
          });
      }
      if (!this.state.loggedIn) {
        this.buildChart(
          [...this.state.weightArray, this.state.weightInput],
          [...this.state.dateArray, this.state.dateInput],
          new Array(this.state.weightArray.length + 1).fill(
            this.state.goalInput
          )
        );
      }
    } else {
      alert('one or more fields required');
    }
    this.setState({ weightInput: '', dateInput: '' });
  };

  handleWeight = (event) => {
    this.setState({ weightInput: event.target.value });
  };

  handleDate = (event) => {
    this.setState({ dateInput: event.target.value });
  };

  handleGoal = (event) => {
    event.preventDefault();
    this.setState({ goalInput: event.target.value });
  };

  handleGoalSubmit = (event) => {
    event.preventDefault();
    const upDatedItem = {
      goal: this.state.goalInput,
      unit: this.state.unitInput,
      weight: this.state.weightArray,
      date: this.state.dateArray,
    };
    if (this.state.loggedIn) {
      axios
        .put(
          'https://warm-inlet-95424.herokuapp.com/api/stuff/' + this.state.id,
          upDatedItem,
          {
            headers: {
              Authorization: `Bearer ${this.state.token}`,
            },
          }
        )
        .then((res) => {
          this.afterLogin();
        });
    }
    this.setState({
      unit: this.state.unitInput,
      goalDisplay: this.state.goalInput,
    });
    if (!this.state.loggedIn && this.state.weightArray.length !== 0) {
      this.buildChart(
        this.state.weightArray,
        this.state.dateArray,
        new Array(this.state.weightArray.length).fill(this.state.goalInput)
      );
    }
  };

  callbackFunction = (childData) => {
    this.setState({ data: childData.updateCounter });

    if (!this.state.loggedIn) {
      this.setState({
        weightArray: childData.weightArray,
        dateArray: childData.dateArray,
        data: childData.updateCounter,
      });
    }
  };

  sendDropDownCallback = (childData) => {
    this.setState({
      childweight: childData.dropDownWeight,
      childDate: childData.dropDownDate,
      childIdentifier: childData.dropDownIdentifier,
    });
  };
  sendModalOpenCallBack = (childData) => {
    this.setState({
      openModalEdit: childData.openModal,
    });
  };
  //functions for login page
  handleTopSignUpButton = (event) => {
    event.preventDefault();
    this.setState({
      loginTopActive: false,
      error: 0,
    });
  };

  handleTopLoginButton = (event) => {
    event.preventDefault();
    this.setState({
      loginTopActive: true,
      error: 0,
    });
  };

  handleEmail = (event) => {
    event.preventDefault();
    this.setState({ emailInput: event.target.value });
  };

  handlePassword = (event) => {
    event.preventDefault();
    this.setState({ passwordInput: event.target.value });
  };

  handleFirstName = (event) => {
    event.preventDefault();
    this.setState({ firstnameInput: event.target.value });
  };

  handleLogin = (event) => {
    event.preventDefault();
    this.setState({ loadingImage: 'loadingImage' });

    axios
      .post('https://warm-inlet-95424.herokuapp.com/api/auth/login', {
        email: this.state.emailInput.toLowerCase(),
        password: this.state.passwordInput,
      })
      .then(
        (response) => {
          this.setState({
            loggedIn: true,
            error: 0,
            loadingImage: 'noDisplay',
            token: response.data.token,
          });

          this.afterLogin();
        },
        (error) =>
          this.setState({
            loggedIn: false,
            error: 1,

            loadingImage: 'noDisplay',
          })
      );
  };

  handleSignUp = (event) => {
    event.preventDefault();
    this.setState({ loadingImage: 'loadingImage' });
    this.state.passwordInput !== '' &&
    this.state.firstnameInput !== '' &&
    this.state.emailInput !== ''
      ? axios
          .post('https://warm-inlet-95424.herokuapp.com/api/auth/signup', {
            email: this.state.emailInput.toLowerCase(),
            password: this.state.passwordInput,
          })
          .then(
            (response) => {
              axios
                .post('https://warm-inlet-95424.herokuapp.com/api/auth/login', {
                  email: this.state.emailInput.toLowerCase(),
                  password: this.state.passwordInput,
                })
                .then(
                  (response) => {
                    this.setState({
                      loggedIn: true,
                      error: 0,
                      loadingImage: 'noDisplay',
                      token: response.data.token,
                    });
                    axios
                      .post(
                        'https://warm-inlet-95424.herokuapp.com/api/stuff',
                        {
                          id: '',
                          weight: [],
                          date: [],
                          goal: 0,
                          unit: 'None',
                          email: this.state.emailInput.toLowerCase(),
                          username: this.state.firstnameInput,
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${response.data.token}`,
                          },
                        }
                      )
                      .then((response) => {
                        this.afterLogin();
                      });
                  },
                  (error) =>
                    this.setState({
                      loggedIn: false,
                      error: 1,
                      loadingImage: 'noDisplay',
                    })
                );
            },
            (error) =>
              this.setState({
                loggedIn: false,
                error: 3,
                loadingImage: 'noDisplay',
              })
          )
      : this.setState({ error: 2, loadingImage: 'noDisplay' });
  };

  handleKg = () => {
    this.setState({ unitInput: 'kg' });
  };

  handleLb = () => {
    this.setState({ unitInput: 'lb' });
  };

  handleNone = () => {
    this.setState({ unitInput: 'None' });
  };
  handleLogOut = () => {
    window.location.reload();
  };

  handleCloseModal = () => {
    this.setState({
      childweight: '',
      childDate: '',
    });
  };
  handleDateChange = (event) => {
    this.setState({ childDate: event.target.value });
  };
  handleWeightChange = (event) => {
    this.setState({ childweight: event.target.value });
  };

  handleUpdate = (event) => {
    event.preventDefault();
    let weightArray = [];
    let dateArray = [];

    let whenloggedOut = (weight, date) => {
      if (!this.state.loggedIn) {
        this.setState({
          weightArray: weight,
          dateArray: date,
        });
      }
    };

    var updatedObject = trackerObjectglobal.filter(
      (number) => number.identifier !== this.state.childIdentifier
    );
    updatedObject.push({
      weight: this.state.childweight,
      date: this.state.childDate,
      identifier: updatedObject.length,
    });
    for (let i = 0; i < updatedObject.length; i++) {
      weightArray.push(updatedObject[i].weight);
      dateArray.push(updatedObject[i].date);
    }
    console.log(weightArray, dateArray);
    whenloggedOut(weightArray, dateArray);
    if (this.state.loggedIn) {
      axios
        .put(
          'https://warm-inlet-95424.herokuapp.com/api/stuff/' + this.state.id,
          {
            weight: weightArray,
            date: dateArray,
          },
          {
            headers: {
              Authorization: `Bearer ${this.state.token}`,
            },
          }
        )
        .then((res) => {
          this.afterLogin();
        });
    }
  };

  render() {
    let trackerObject = [];
    for (let i = 0; i < this.state.weightArray.length; i++) {
      trackerObject[i] = {
        weight: this.state.weightArray[i],
        date: this.state.dateArray[i],
        goal: this.state.goalArray[i],
        identifier: i,
      };
    }

    trackerObject.sort(function (a, b) {
      var dateB = new Date(a.date),
        dateA = new Date(b.date);
      return dateA - dateB; //sort by date ascending
    });

    if (trackerObject.length > 0) {
      this.setState({
        weightDisplay: trackerObject[0].weight,
      });
      trackerObjectglobal = trackerObject;
    }
    if (trackerObject.length <= 0) {
      this.setState({
        weightDisplay: '',
      });
    }

    const weightItems = trackerObject.map((item) => (
      <WeightItem
        item={item}
        parentCallback={this.callbackFunction}
        token={this.state.token}
        unit={this.state.unit}
        trackerObject={trackerObject}
        id={this.state.id}
        afterLogin={this.afterLogin}
        loggedIn={this.state.loggedIn}
        sendDropDownCallback={this.sendDropDownCallback}
        sendModalOpenCallBack={this.sendModalOpenCallBack}
      />
    ));

    return (
      <body>
        <div className='jumbotron text-center' style={{ marginBottom: '0' }}>
          <h1>Weight Tracker</h1>
          <p>If you can conquer yourself, you can conquer Everest</p>
        </div>
        <nav className='navbar navbar-expand-sm bg-dark navbar-dark'>
          <button
            className='navbar-toggler'
            type='button'
            data-toggle='collapse'
            data-target='#collapsibleNavbar'>
            <span className='navbar-toggler-icon'></span>
          </button>
          <div className='collapse navbar-collapse' id='collapsibleNavbar'>
            <ul className='navbar-nav'>
              <li className='nav-item'>
                <div
                  className='nav-link'
                  data-toggle='modal'
                  data-target='#myModalGoal'>
                  Goal Weight:
                  {this.state.goalDisplay === 0
                    ? ''
                    : this.state.goalDisplay}{' '}
                  {this.state.unit === 'None' ? '' : this.state.unit}
                </div>
              </li>
              <li className='nav-item'>
                <div
                  className='nav-link'
                  data-toggle='modal'
                  data-target='#myModalCurrent'>
                  Current Weight:
                  {this.state.weightArray === []
                    ? ''
                    : this.state.weightDisplay}
                  {this.state.weightArray.length === 0 ||
                  this.state.unit === 'None'
                    ? ''
                    : this.state.unit}
                </div>
              </li>
              <li className='nav-item'>
                <div
                  className='nav-link'
                  data-toggle='modal'
                  data-target='#myModalLogin'>
                  {this.state.loggedIn ? 'Logout' : 'Login'}
                </div>
              </li>
            </ul>
          </div>
        </nav>

        {/*The Modal */}
        <div className='modal' id='myModalGoal'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              {/*The Modal Header */}
              <div className='modal-header'>
                <h4 className='modal-title'>Goal Weight</h4>
                <button type='button' className='close' data-dismiss='modal'>
                  &times;
                </button>
              </div>

              {/*The Modal Body */}
              <div className='modal-body'>
                {' '}
                <input
                  type='number'
                  className='form-control'
                  placeholder='Enter Goal Weight'
                  value={this.state.goalInput}
                  onChange={this.handleGoal}
                  id='goal'
                  style={{ marginBottom: '1%' }}
                />
              </div>
              <div className='dropdown'>
                <button
                  className='btn btn-secondary dropdown-toggle'
                  type='button'
                  id='dropdownMenuButton'
                  data-toggle='dropdown'
                  aria-haspopup='true'
                  aria-expanded='false'
                  style={{ marginLeft: '4%' }}>
                  Unit
                </button>
                <div
                  className='dropdown-menu'
                  aria-labelledby='dropdownMenuButton'>
                  <div
                    className={
                      this.state.unitInput === 'None'
                        ? 'dropdown-item active'
                        : 'dropdown-item'
                    }
                    onClick={this.handleNone}>
                    None
                  </div>
                  <div
                    className={
                      this.state.unitInput === 'kg'
                        ? 'dropdown-item active'
                        : 'dropdown-item'
                    }
                    onClick={this.handleKg}>
                    kg
                  </div>
                  <div
                    className={
                      this.state.unitInput === 'lb'
                        ? 'dropdown-item active'
                        : 'dropdown-item'
                    }
                    onClick={this.handleLb}>
                    lb
                  </div>
                </div>
                <span>
                  {'  '}
                  {this.state.unitInput}
                </span>
              </div>

              {/*The Modal footer*/}
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn btn-danger'
                  data-dismiss='modal'
                  onClick={this.handleGoalSubmit}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className='modal' id='myModalCurrent'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              {/*The Modal Header */}
              <div className='modal-header'>
                <h4 className='modal-title'>Current Weight</h4>
                <button type='button' className='close' data-dismiss='modal'>
                  &times;
                </button>
              </div>

              {/*The Modal Body */}
              <div className='modal-body'>
                {' '}
                <input
                  type='number'
                  className='form-control'
                  placeholder='Enter Current Weight'
                  value={this.state.weightInput}
                  onChange={this.handleWeight}
                  id='weight'
                  style={{ marginBottom: '2%' }}
                />
                <input
                  type='date'
                  name='date'
                  className='form-control'
                  placeholder='Date'
                  value={this.state.dateInput}
                  onChange={this.handleDate}
                  id='date'
                />
              </div>

              {/*The Modal footer*/}
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn btn-danger'
                  data-dismiss='modal'
                  onClick={this.handleWeightSubmit}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='modal' id='myModalLogin'>
          <div className='modal-dialog'>
            <div className='modal-content'>
              {/*The Modal Header */}
              <div className='modal-header'>
                <button type='button' className='close' data-dismiss='modal'>
                  &times;
                </button>
              </div>

              {/*The Modal Body */}
              <div className={this.state.loggedIn ? 'noDisplay' : 'modal-body'}>
                {' '}
                <div className='row'>
                  {' '}
                  <button
                    className={
                      this.state.loginTopActive
                        ? 'btn col-sm-6  btn-primary'
                        : 'btn btn-secondary col-sm-6'
                    }
                    onClick={this.handleTopLoginButton}>
                    Log in
                  </button>
                  <button
                    className={
                      this.state.loginTopActive
                        ? 'col-sm-6 btn btn-secondary'
                        : 'btn btn-primary col-sm-6'
                    }
                    onClick={this.handleTopSignUpButton}>
                    Sign up
                  </button>
                </div>
                <p
                  className='text-danger text-center'
                  style={{ marginTop: '1%' }}>
                  {this.state.error === 1 && !this.state.loggedIn
                    ? 'Incorrect email address or password'
                    : this.state.error === 2 && !this.state.loggedIn
                    ? 'Required field empty'
                    : this.state.error === 3 && !this.state.loggedIn
                    ? 'There is already an account with this email address'
                    : ''}
                </p>
                <input
                  name='firstName'
                  placeholder='First Name'
                  className={
                    this.state.loginTopActive === false
                      ? 'form-control'
                      : 'noDisplay'
                  }
                  value={this.state.firstnameInput}
                  onChange={this.handleFirstName}
                  id='firstName'
                  style={{ marginTop: '30px' }}
                />
                <input
                  type='email'
                  className='form-control'
                  placeholder='Email'
                  value={this.state.emailInput}
                  onChange={this.handleEmail}
                  id='email'
                  style={{ marginTop: '30px' }}
                />
                <input
                  type='password'
                  name='password'
                  placeholder='Password'
                  className='form-control'
                  value={this.state.passwordInput}
                  onChange={this.handlePassword}
                  id='password'
                  style={{ marginTop: '30px' }}
                />
              </div>
              <div className={this.state.loggedIn ? 'modal-body' : 'noDisplay'}>
                Are you sure you want to log out?
              </div>

              {/*The Modal footer*/}
              <div className='modal-footer'>
                <span className={this.state.loadingImage}>
                  <span className='spinner-border text-muted text-center'></span>
                </span>
                <button
                  type='button'
                  className='btn btn-danger'
                  onClick={
                    this.state.loginTopActive && !this.state.loggedIn
                      ? this.handleLogin
                      : !this.state.loginTopActive && !this.state.loggedIn
                      ? this.handleSignUp
                      : this.handleLogOut
                  }>
                  {this.state.loggedIn ? 'Yes' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className={
            this.state.weightArray.length > 0 ? 'container' : 'noDisplay'
          }
          style={{ marginTop: '30px' }}>
          <div className='row'>
            <div className='col-sm-8'>
              <div className={classes.graphContainer}>
                <canvas id='myChart' ref={this.chartRef} />
              </div>
            </div>
            <div className='col-sm-4'>
              <table className='table table-striped'>
                <thead>
                  <tr>
                    <th>
                      Weight{' '}
                      {this.state.unit === 'None'
                        ? ''
                        : '(' + this.state.unit + ')'}
                    </th>
                    <th>Date</th>
                    <th>Edit/Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {weightItems}
                  <div class='modal' id='myModalEdit'>
                    <div class='modal-dialog'>
                      <div class='modal-content'>
                        {/*The Modal Header */}
                        <div class='modal-header'>
                          <h4 class='modal-title'>Weight</h4>
                          <button
                            type='button'
                            class='close'
                            data-dismiss='modal'
                            onClick={this.handleCloseModal}>
                            &times;
                          </button>
                        </div>

                        {/*The Modal Body */}
                        <div class='modal-body'>
                          {' '}
                          <input
                            type='number'
                            class='form-control'
                            placeholder='Enter Current Weight'
                            value={this.state.childweight}
                            onChange={this.handleWeightChange}
                            id='weight'
                            style={{ marginBottom: '2%' }}
                          />
                          <input
                            type='date'
                            name='date'
                            class='form-control'
                            placeholder='Date'
                            value={this.state.childDate}
                            onChange={this.handleDateChange}
                            id='date'
                          />
                        </div>

                        {/*The Modal footer*/}
                        <div class='modal-footer'>
                          <button
                            type='button'
                            class='btn btn-danger'
                            data-dismiss='modal'
                            onClick={this.handleUpdate}>
                            Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </tbody>
              </table>
              <p
                className={
                  this.state.todos.length < 0 ? 'noDisplay' : 'text-center'
                }>
                {this.state.weightDisplay == this.state.goalDisplay
                  ? 'Congratulations! You have reached your goal'
                  : this.state.weightDisplay > this.state.goalDisplay
                  ? 'Lose ' +
                    (this.state.weightDisplay - this.state.goalDisplay) +
                    ' ' +
                    (this.state.unit === 'None' ? '' : this.state.unit) +
                    ' to reach your goal'
                  : 'Gain ' +
                    (this.state.goalDisplay - this.state.weightDisplay) +
                    ' ' +
                    (this.state.unit === 'None' ? '' : this.state.unit) +
                    ' to reach your goal'}
              </p>
            </div>
          </div>
        </div>
        <h2
          className={
            this.state.weightArray.length > 0
              ? 'noDisplay'
              : 'container text-center text-muted'
          }
          style={{ paddingTop: '10%' }}>
          No Data Entered
        </h2>
      </body>
    );
  }
}
