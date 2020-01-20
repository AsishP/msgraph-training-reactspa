import React from 'react';
import { Table } from 'reactstrap';
import moment from 'moment';
import { config } from './Config';
import { getEvents } from './GraphService';
import { UserAgentApplication } from 'msal';
import { UserAgent } from './UserAgent';

function formatDateTime(dateTime : Date) {
  return moment.utc(dateTime).local().format('M/D/YY h:mm A');
}

interface CalendarProps
{
  showError?: (type: string, errormessage : string) => void; 
}

interface CalendarState
{
  events : any[];
}


export default class Calendar extends React.Component<CalendarProps, CalendarState> {
  private userAgentApplication : UserAgentApplication
  constructor(props : any) {
    super(props);
    this.userAgentApplication = new UserAgent().userAgentApplication;
    this.state = {
      events: []
    };
  }

  async componentDidMount() {
    try {
      // Get the user's access token
      var accessToken = await this.userAgentApplication.acquireTokenSilent({
        scopes: config.scopes
      });
      // Get the user's events
      var events = await getEvents(accessToken);
      // Update the array of events in state
      this.setState({events: events.value});
    }
    catch(err) {
      this.props.showError!('ERROR', JSON.stringify(err));
    }
  }

  render() {
    return (
      <div>
        <h1>Calendar</h1>
        <Table>
          <thead>
            <tr>
              <th scope="col">Organizer</th>
              <th scope="col">Subject</th>
              <th scope="col">Start</th>
              <th scope="col">End</th>
            </tr>
          </thead>
          <tbody>
            {this.state.events.map(
              function(event){
                return(
                  <tr key={event.id}>
                    <td>{event.organizer.emailAddress.name}</td>
                    <td>{event.subject}</td>
                    <td>{formatDateTime(event.start.dateTime)}</td>
                    <td>{formatDateTime(event.end.dateTime)}</td>
                  </tr>
                );
              })}
          </tbody>
        </Table>
      </div>
    );
  }
}