const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ query, variables })
    });
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReviver);

    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code == 'BAD_USER_INPUT') {
        const details = error.extensions.exception.errors.join('\n ');
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }
    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
  }
}

function GuestRow(props) {
  const guest = props.guest;
  return (
    <tr>
      <td>{guest.id}</td>
      <td>{guest.name}</td>
      <td>{guest.contact}</td>
      <td>{new Date(Date.parse(guest.arrival)).toLocaleTimeString('en-US')}</td>
      <td><button className="btn" onClick={function(e) {
        e.preventDefault();
        const guestID = guest.id;
        props.removeGuest(guestID);
      }}>Remove</button></td>
    </tr>
  );
}

function Homepage(props) {
  const guestRows = props.guests.map(guest =>
    <GuestRow key={guest.id} guest={guest} removeGuest={props.removeGuest}/>
  );
  const free = 25 - props.guests.length;

  return (
    <form>
      <h2>Welcome!</h2>
      <p>-------------------------------------------------------------------</p>
      <h3>Available Slots: <span>{free}</span></h3>
      <p>-------------------------------------------------------------------</p>
      <table className="bordered-table">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Contact</th>
            <th>Arrival Time</th>
            <th> </th>
          </tr>
        </thead>
        <tbody>
          {guestRows}
        </tbody>
      </table>
    </form>
  );
}

class AddGuest extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.addGuest;
    const guest = {
      name: form.name.value, contact: form.contact.value, remove: 'Remove',
    }
    this.props.addGuest(guest);
    form.name.value = ""; form.contact.value = "";
  }

  render() {
    return (
      <form name="addGuest" onSubmit={this.handleSubmit}>
        <h3>Add Guest to Waitlist</h3>
        <p></p>
        <input type="text" name="name" placeholder="Guest Name" required/>
        <input type="text" name="contact" placeholder="Contact Number" required/>
        <p></p>
        <button>Add Guest</button>
      </form>
    );
  }
}

class RemoveGuest extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.removeGuest;
    const guestID = form.id.value;
    this.props.removeGuest(guestID);
    form.id.value = "";
  }

  render() {
    return (
      <form name="removeGuest" onSubmit={this.handleSubmit}>
        <h3>Remove Guest from Waitlist</h3>
        <p></p>
        <input type="text" name="id" placeholder="ID" required/>
        <p></p>
        <button>Remove Guest</button>
      </form>
    );
  }
}

function Header(props) {
  return (
    <div>
      <img src="https://cdn.dribbble.com/users/165280/screenshots/3717720/hc_1.jpg" alt="new" className="logo" />
      <h1>Hotel California Waitlist System</h1>
      <div id="NavBar" className="topnav">
        <a id="hom" className="active" onClick={function(e) {
          e.preventDefault();
          props.hideAdd();
          props.hideRem();
          document.getElementById('hom').className = "active";
          document.getElementById('add').className = "inactive";
          document.getElementById('rem').className = "inactive";
        }}>Home</a>
        <a id="add" className="inactive" onClick={function(e) {
          e.preventDefault();
          props.showAdd();
          props.hideRem();
          document.getElementById('hom').className = "inactive";
          document.getElementById('add').className = "active";
          document.getElementById('rem').className = "inactive";
        }}>Add Guest</a>
        <a id="rem" className="inactive" onClick={function(e) {
          e.preventDefault();
          props.showRem();
          props.hideAdd();
          document.getElementById('hom').className = "inactive";
          document.getElementById('add').className = "inactive";
          document.getElementById('rem').className = "active";
        }}>Remove Guest</a>
      </div>
    </div>
  );
}

class Footer extends React.Component {
  render () {
    return (
      <p id="footer" className="footer"><i>Powered By: ArvindS (A0228522J)</i></p>
    )
  }
}

class Wholepage extends React.Component {
  constructor() {
    super();
    this.state = { guests: [], addHidden: true, remHidden: true };
    this.addGuest = this.addGuest.bind(this);
    this.removeGuest = this.removeGuest.bind(this);
    this.showAdd = this.showAdd.bind(this);
    this.hideAdd = this.hideAdd.bind(this);
    this.showRem = this.showRem.bind(this);
    this.hideRem = this.hideRem.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
      guestList {
        id name contact arrival
      }
    }`;

    const data = await graphQLFetch(query);
    if (data) {
      this.setState({ guests: data.guestList });
      this.state.guests.map(async (guest, key) => {
        const updQuery = `mutation guestUpdate($id1: Int!, $id2: Int!) {
          guestUpdate(oldId: $id1, newId: $id2)
        }`;
        var id2 = key+1
        var id1 = guest.id
        await graphQLFetch(updQuery, { id1, id2 });
      });
    }

    const updData = await graphQLFetch(query);
    if (updData) {
      this.setState({ guests: updData.guestList });
    }
  }

  showAdd () {
    this.setState({ addHidden: false });
  }
  hideAdd () {
    this.setState({ addHidden: true });
  }

  showRem () {
    this.setState({ remHidden: false });
  }
  hideRem () {
    this.setState({ remHidden: true });
  }

  async addGuest(guest) {
    let guestExists = false
    for (var i=0; i < this.state.guests.length; i++) {
      if (this.state.guests[i].contact == guest.contact) {
        guestExists = true;
        alert('This guest is already on the waitlist!');
        return;
      }
    }
    if (this.state.guests.length < 25 && guestExists == false) {
      const query = `mutation guestAdd($guest: GuestInputs!) {
        guestAdd(guest: $guest) {
          id
        }
      }`;
      const data = await graphQLFetch(query, { guest });
      if (data) {
        this.loadData();
      }
    } else {
      alert('Waitlist is Full!');
    }
  }

  async removeGuest(guestID) {
    var validId = false;
    const id = parseInt(guestID);
    for (var i=0; i < this.state.guests.length; i++) {
      if (this.state.guests[i].id === id) {
        validId = true;
      }
    }
    if (validId === true) {
      const query = `mutation guestRemove($id: Int!) {
        guestRemove(id: $id) 
      }`;
      const data = await graphQLFetch(query, { id });
      if (data) {
        this.loadData();
      }
    } else {
      alert('No such ID!');
    }
  }

  render() {
    return (
      <React.Fragment>
        <Header showAdd={this.showAdd} hideAdd={this.hideAdd} showRem={this.showRem} hideRem={this.hideRem} />
        {this.state.addHidden==false && <AddGuest addGuest={this.addGuest} />}
        {this.state.remHidden==false && <RemoveGuest removeGuest={this.removeGuest} />}
        <Homepage guests={this.state.guests} removeGuest={this.removeGuest} />
        <Footer />
      </React.Fragment>
    );
  }
}

const element = <Wholepage />;
ReactDOM.render(element, document.getElementById('contents'));