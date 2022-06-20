// Company

function loadCompanyTable() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://localhost:8080/api/events");
    xhttp.send();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log(this.responseText);
        var trHTML = ''; 
        const objects = JSON.parse(this.responseText);
        
        for (let object of objects) {
            if (object['deleteStatus'] != 1) {
                trHTML += '<tr>'; 
                trHTML += '<td loadCustomerTable('+object['eventCompany']+')>'+object['eventId']+'</td>';
                trHTML += '<td loadCustomerTable('+object['eventCompany']+')>'+object['eventCompany']+'</td>';
                trHTML += '<td loadCustomerTable('+object['eventCompany']+')>'+object['eventAddress']+'</td>';
                trHTML += '<td loadCustomerTable('+object['eventCompany']+')>'+object['email']+'</td>';
                trHTML += '<td loadCustomerTable('+object['eventCompany']+')>'+object['phone']+'</td>';
                trHTML += '<td class="action-box"><button type="button" class="btn btn-outline-success btn-table" onclick="showCompanyEditBox('+object['eventId']+')">Edit</button>';
                trHTML += '<button type="button" class="btn btn-outline-danger btn-table" onclick="companyDelete('+object['eventId']+')">Del</button></td>';
                trHTML += "</tr>";
            }
        }
        document.getElementById("company").innerHTML = trHTML;
      }
    };
}

function companyDelete(id) {
    // alert(id);
    const xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", `http://localhost:8080/api/event/delete/${id}`);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send();
    // console.log(id)
    // xhttp.send(JSON.stringify({ 
    //   "eventId": id
    // }));
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        // const objects = JSON.parse(this.responseText);
        Swal.fire('Delete Success');
        loadCompanyTable();
      } 
    };
}

function showCompanyEditBox(id) {
    // alert(id);
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", `http://localhost:8080/api/event/${id}`);
    xhttp.send();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        const objects = JSON.parse(this.responseText);
        for (let object of objects) {
        Swal.fire({
          title: 'Edit event',
          html:
          `<input id="eventId" type="hidden" value=${id}>` +
        '<input id="eventTitle" class="swal2-input" placeholder="Title" value="'+object['eventCompany']+'">' +
        '<input id="eventDescription" class="swal2-input" placeholder="Description" value="'+object['eventAddress']+'">' +
        '<input id="startDate" class="swal2-input" placeholder="YYYY-MM-DD" value="'+object['email']+'">' +
        '<input id="endDate" class="swal2-input" placeholder="YYYY-MM-DD" value="'+object['phone']+'">',
            
          focusConfirm: false,
          preConfirm: () => {
            eventEdit(id);
          }
        })
      }

      }
    };
  }
  
  function eventEdit(id) {
    const Title = document.getElementById("eventTitle").value;
    const Description = document.getElementById("eventDescription").value;
    const start = document.getElementById("startDate").value;
    const end = document.getElementById("endDate").value;
    const avenue = document.getElementById("avenue").value;
    const maxMembers = document.getElementById("maxMembers").value;
      
    const xhttp = new XMLHttpRequest();
    xhttp.open("PUT", `http://localhost:8080/api/event/${id}`);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify({ 
      "eventId": id 
      ,"eventTitle": Title
      , "eventDescription": Description
      , "startDate": start
      , "endDate": end
      , "avenue": avenue
      , "maxMembers": maxMembers
}));
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        // const objects = JSON.parse(this.responseText);
        Swal.fire({
          icon: "success",
          position:"center",
          text: "Updated"
        });
        loadTable();
      }
    };
  }

// loadCompanyTable();

function showAddCompanyBox() {
    Swal.fire({
      title: 'Company',
      html:
        '<input id="eventId" type="hidden">' +
        '<input id="eventCompany" class="swal2-input" placeholder="Company">' +
        '<input id="eventAddress" class="swal2-input" placeholder="Address">' +
        '<input id="email" class="swal2-input" type="email" placeholder="1234@email.com">' +
        '<input id="phone" class="swal2-input" placeholder="xxx-xxxxxxx">',
      focusConfirm: false,
      preConfirm: () => {
        companyCreate();
      }
    })
  }

  function companyCreate() {
    const Company = document.getElementById("eventCompany").value;
    const Address = document.getElementById("eventAddress").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
      
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://localhost:8080/api/event");
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify({ 
            "eventCompany": Company
            , "eventAddress": Address
            , "email": email
            , "phone": phone
    }));
            
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        // const objects = JSON.parse(this.responseText);
        Swal.fire('Create Success');
        loadCompanyTable();
      }
    };
  }

  // Customer

function loadCustomerTable(eventCompany) {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", `http://localhost:8080/api/events${eventCompany}`);
    xhttp.send();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log(this.responseText);
        var trHTML = ''; 
        const objects = JSON.parse(this.responseText);
        for (let object of objects) {
          trHTML += '<tr>'; 
          trHTML += '<td>'+object['eventId']+'</td>';
          trHTML += '<td>'+object['name']+'</td>';
          trHTML += '<td>'+object['eventCompany']+'</td>';
          trHTML += '<td>'+object['email']+'</td>';
          trHTML += '<td>'+object['phone']+'</td>';
          trHTML += '<td class="action-box"><button type="button" class="btn btn-outline-success btn-table" onclick="showCustomerEditBox('+object['eventId']+')">Edit</button>';
          trHTML += '<button type="button" class="btn btn-outline-danger btn-table" onclick="eventDelete('+object['eventId']+')">Del</button></td>';
          trHTML += "</tr>";
        }
        document.getElementById("customer").innerHTML = trHTML;
      }
    };
}