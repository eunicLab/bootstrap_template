import React from 'react';
import axios from 'axios';
import '../App.css';

class WeightItem extends React.Component {
  constructor(props) {
    super(props);
    global.updateCount = 0;
    this.state = {
      weightInput: '',
      dateInput: '',
      updateCount: global.updateCount,
      weightArray: [],
      dateArray: [],
    };
  }

  componentDidMount = () => {
    window.$('#myModalEdit').modal('hide');
  };

  handleDelete = (event) => {
    event.preventDefault();

    let weightArray = [];
    let dateArray = [];
    let whenloggedOut = (weight, date) => {
      if (!this.props.loggedIn) {
        this.sendData(weight, date, this.state.updateCounter + 1);
      }
    };

    var updatedObject = this.props.trackerObject.filter(
      (number) => number.identifier !== this.props.item.identifier
    );

    for (let i = 0; i < updatedObject.length; i++) {
      weightArray.push(updatedObject[i].weight);
      dateArray.push(updatedObject[i].date);
    }
    whenloggedOut(weightArray, dateArray);

    if (this.props.loggedIn) {
      axios
        .put(
          'https://warm-inlet-95424.herokuapp.com/api/stuff/' + this.props.id,
          {
            weight: weightArray,
            date: dateArray,
          },
          {
            headers: {
              Authorization: `Bearer ${this.props.token}`,
            },
          }
        )
        .then((res) => {
          this.props.afterLogin();
        });
    }
  };

  handleEdit = (event) => {
    event.preventDefault();
    this.setState({
      weightInput: this.props.item.weight,
      dateInput: this.props.item.date,
    });
  };
  handleDateChange = (event) => {
    this.setState({ dateInput: event.target.value });
  };
  handleWeightChange = (event) => {
    this.setState({ weightInput: event.target.value });
  };

  sendData = (weight, date, counter) => {
    this.props.parentCallback({
      updatecounter: counter,
      weightArray: weight,
      dateArray: date,
    });
  };

  sendDropDown = () => {
    this.props.sendDropDownCallback({
      dropDownWeight: this.props.item.weight,
      dropDownDate: this.props.item.date,
      dropDownIdentifier: this.props.item.identifier,
    });
  };

  sendModalOpen = () => {
    this.sendDropDown();
    this.props.sendModalOpenCallBack({
      openModal: true,
    });
  };

  render() {
    return (
      <tr>
        <td>{this.props.item.weight}</td>
        <td>{this.props.item.date}</td>
        <td>
          <div class='dropdown'>
            <button
              class='btn  dropdown-toggle'
              data-toggle='dropdown'
              onClick={this.sendDropDown}></button>
            <div class='dropdown-menu'>
              <div
                class='dropdown-item'
                data-toggle='modal'
                data-target='#myModalEdit'
                onClick={this.sendModalOpen}>
                Edit
              </div>
              <div class='dropdown-item' onClick={this.handleDelete}>
                Delete
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  }
}

export default WeightItem;
