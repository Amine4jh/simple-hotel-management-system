const express = require("express");
// const fs = require("fs");
const path = require("path");
const mydb = require("./config/db");
// import { header, footer } from "./components";

const app = express();
const port = 3000;

// Built-in middleware for classicHTML form data
app.use(express.urlencoded({ extended: true }));

// Built-in middleware for parsing json data
app.use(express.json());

// Built-in middleware for static files
app.use(express.static(path.join(__dirname)));
app.use("/reservations", express.static(path.join(__dirname)));
app.use("/reservations/edit", express.static(path.join(__dirname)));
app.use("/guests", express.static(path.join(__dirname)));
app.use("/guests/edit", express.static(path.join(__dirname)));
app.use("/rooms", express.static(path.join(__dirname)));
app.use("/rooms/edit", express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Reservations Routes Starts
app.get("/reservations", (req, res) => {
  res.sendFile(path.join(__dirname, "reservations", "index.html"));
});

app.get("/reservations/show", (req, res) => {
  let { sort, filter } = req.query;
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
  });
  const resHeader = ` 
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reservations Show Page</title>
        <link rel="stylesheet" href="style.css" />
      </head>
      <body>
        <section class="container">
          <a href="/reservations" id="btn">Back</a>
          <table>
            <tr>
              <th>Guest Full Name</th>
              <th>Room Number</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Total (TTC)</th>
              <th>Actions</th>
            </tr>
    `;
  const resFooter = `
        </table>
      </section>
    </body>
  </html>
  `;
  const sqlQuery =
    "select reservations.*, guests.first_name, guests.last_name, rooms.number from reservations join guests on reservations.guest_id = guests.id join rooms on reservations.room_id = rooms.id";
  mydb.query(sqlQuery, (err, reservations) => {
    if (err) {
      console.log(`Something Wrong Because: ${err}`);
      res.send("<h1>An unknown error occured!</h1>");
    }
    res.write(resHeader);
    // Sort
    if (sort) {
      const sortArr = sort.split("-");
      if (sortArr[0] === "date") {
        if (sortArr[1] === "start") {
          if (sortArr[2] === "asc") {
            reservations.sort((a, b) => {
              return new Date(a.start_date) - new Date(b.start_date);
            });
          } else if (sortArr[2] === "desc") {
            reservations.sort((a, b) => {
              return new Date(b.start_date) - new Date(a.start_date);
            });
          }
        } else if (sortArr[1] === "end") {
          if (sortArr[2] === "asc") {
            reservations.sort((a, b) => {
              return new Date(a.end_date) - new Date(b.end_date);
            });
          } else if (sortArr[2] === "desc") {
            reservations.sort((a, b) => {
              return new Date(b.end_date) - new Date(a.end_date);
            });
          }
        }
      } else if (sortArr[0] === "price") {
        if (sortArr[1] === "asc") {
          reservations.sort((a, b) => a.total - b.total);
        } else if (sortArr[1] === "desc") {
          reservations.sort((a, b) => b.total - a.total);
        }
      } else if (sortArr[0] === "name") {
        if (sortArr[1] === "asc") {
          reservations.sort((a, b) => {
            const nameA = a.last_name.toUpperCase();
            const nameB = b.last_name.toUpperCase();
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          });
        } else if (sortArr[1] === "desc") {
          reservations.sort((a, b) => {
            const nameA = a.last_name.toUpperCase();
            const nameB = b.last_name.toUpperCase();
            if (nameA > nameB) {
              return -1;
            }
            if (nameA < nameB) {
              return 1;
            }
            return 0;
          });
        }
      }
    } 
    if (filter) {
      const filterArr = filter.split("-");
      if (filterArr[0] === 'price') {
        
      }
    }
    for (let reservation of reservations) {
      res.write(`
        <tr>
          <td>${reservation.last_name} ${reservation.first_name}</td>
          <td>${reservation.number}</td>
          <td>${reservation.start_date}</td>
          <td>${reservation.end_date}</td>
          <td>${reservation.total} MAD</td>
          <td>
            <a href="/reservations/edit/${reservation.id}" id="editBtn">Edit</a>
            <a href="/reservations/delete/${reservation.id}" onclick="return confirm('Are you sure?')" id="delBtn">Delete</a>
          </td>
        </tr>
      `);
    }
    res.write(`
      <div class="dropdown-container">
        <div class="dropdown">
          <button class="dropbtn">Sort</button>
          <div class="dropdown-content">
          <a href="/reservations/show?sort=date-start-asc">Start Date ASC</a>
          <a href="/reservations/show?sort=date-start-desc">Start Date DESC</a>
          <a href="/reservations/show?sort=date-end-asc">End Date ASC</a>
          <a href="/reservations/show?sort=date-end-desc">End Date DESC</a>
          <a href="/reservations/show?sort=price-asc">Price ASC</a>
          <a href="/reservations/show?sort=price-desc">Price DESC</a>
          <a href="/reservations/show?sort=name-asc">Name A-Z</a>
          <a href="/reservations/show?sort=name-desc">Name Z-A</a>
          </div>
        </div>
        <div class="dropdown">
          <button class="dropbtn">Dropdown Menu</button>
          <div class="dropdown-content">
          <a href="/reservations/show?filter=price-0-100">Smaller than 100</a>
          <a href="/reservations/show?filter=price-100-500">100 - 500</a>
          <a href="/reservations/show?filter=price-500-inf">Greater then 500</a>
          </div>
        </div>
      </div>
    `);
    res.write(`<p id="count">${reservations.length} reservations</p>`);
    res.write(resFooter);
    res.end();
  });
});

app.get("/reservations/create", (req, res) => {
  res.sendFile(path.join(__dirname, "reservations", "create.html"));
});

app.post("/reservations/create", async (req, res) => {
  try {
    let errors = [];
    const { guest, room, sdate, edate } = req.body;
    if (!guest || !room || !sdate || !edate) {
      errors.push("All fields are required.");
    }
    if (errors.length > 0) {
      res.writeHead(500, {
        "Content-Type": "text/html; charset=utf-8",
      });
      for (let error of errors) {
        res.write(error + "<br />");
      }
      res.end();
    } else {
      // Calculate TTC
      const [[result]] = await mydb
        .promise()
        .query(`select price_per_night from rooms where id = ${room}`);
      let ppn = result.price_per_night;

      let startDate = new Date(sdate);
      let endDate = new Date(edate);
      let nights = (endDate - startDate) / 1000 / 60 / 60 / 24;

      let total = ppn * nights;
      let ttc = total + total * 0.05;

      // Insert reservation to database
      const sqlQuery =
        "insert into reservations (guest_id, room_id, start_date, end_date, total) values (?, ?, ?, ?, ?)";
      mydb.query(sqlQuery, [guest, room, sdate, edate, ttc], (err, result) => {
        if (err) {
          console.log("Something wrong because", err);
          res.write("Something wrong");
          res.end();
        }
        console.log("Guest added successfully");
        res.redirect("/reservations/show");
      });
    }
  } catch (err) {
    console.log("Something Wrong Because:", err);
  }
});

app.get("/reservations/edit/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "reservations", "edit.html"));
});

app.post("/reservations/edit/:id", async (req, res) => {
  try {
    let errors = [];
    const { guest, room, sdate, edate } = req.body;
    const { id } = req.params;
    if (!guest || !room || !sdate || !edate) {
      errors.push("All fields are required.");
    }
    if (errors.length > 0) {
      res.writeHead(500, {
        "Content-Type": "text/html; charset=utf-8",
      });
      for (let error of errors) {
        res.write(error + "<br />");
      }
      res.end();
    } else {
      // Calculate TTC
      const [[result]] = await mydb
        .promise()
        .query(`select price_per_night from rooms where id = ${room}`);
      let ppn = result.price_per_night;

      let startDate = new Date(sdate);
      let endDate = new Date(edate);
      let nights = (endDate - startDate) / 1000 / 60 / 60 / 24;

      let total = ppn * nights;
      let ttc = total + total * 0.05;

      // Update reservation in database
      const sqlQuery =
        "update reservations set guest_id = ?, room_id = ?, start_date = ?, end_date = ?, total = ? where id = ?";
      mydb.query(
        sqlQuery,
        [guest, room, sdate, edate, ttc, id],
        (err, result) => {
          if (err) {
            console.log("Something wrong because", err);
            res.write("Something wrong");
            res.end();
          }
          console.log("Guest updated successfully");
          res.redirect("/reservations/show");
        },
      );
    }
  } catch (err) {
    console.log("Something Wrong Because:", err);
  }
});

// Get reservation details to fill the edit form
app.get("/api/reservations/edit/:id", async (req, res) => {
  const { id } = req.params;

  const [[result]] = await mydb
    .promise()
    .query("select * from reservations where id = ?", [id]);
  res.json({
    reservation: result,
  });
});

app.get("/reservations/delete/:id", (req, res) => {
  const { id } = req.params;
  // Delete reservation from database
  const sqlQuery = "delete from reservations where id = ?";
  mydb.query(sqlQuery, [id], (err, result) => {
    if (err) {
      console.log("Something wrong because", err);
      res.write("Something wrong");
      res.end();
    }
    console.log("Guest deleted successfully");
    res.redirect("/reservations/show");
  });
});

// Get guests for creating reservation dropdown
app.get("/api/guests", (req, res) => {
  const sqlQuery = "select id, first_name, last_name from guests";
  mydb.query(sqlQuery, (err, guests) => {
    if (err) {
      console.log("Something wrong because", err);
      res.json({
        error: "Something wrong with the database",
      });
    } else {
      res.status(200).json({
        guests: guests,
      });
    }
  });
});
// Get rooms for creating reservation dropdown
app.get("/api/rooms", (req, res) => {
  const sqlQuery = "select id, number from rooms";
  mydb.query(sqlQuery, (err, rooms) => {
    if (err) {
      console.log("Something wrong because", err);
      res.json({
        error: "Something wrong with the database",
      });
    } else {
      res.status(200).json({
        rooms: rooms,
      });
    }
  });
});
// Reservations Routes Ends

// Guests Routes Starts
app.get("/guests", (req, res) => {
  res.sendFile(path.join(__dirname, "guests", "index.html"));
});

app.get("/guests/show", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
  });
  const guestHeader = ` 
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Home Page</title>
        <link rel="stylesheet" href="style.css" />
      </head>
      <body>
        <section class="container">
          <a href="/guests" id="btn">Back</a>
          <table>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Card ID</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
    `;
  const guestFooter = `
        </table>
      </section>
    </body>
  </html>
  `;

  const sqlQuery = "select * from guests";
  mydb.query(sqlQuery, (err, guests) => {
    if (err) {
      console.log(`Something Wrong Because: ${err}`);
      res.send("<h1>An unknown error occured!</h1>");
    }
    res.write(guestHeader);
    for (let guest of guests) {
      res.write(`
        <tr>
          <td>${guest.first_name}</td>
          <td>${guest.last_name}</td>
          <td>${guest.email}</td>
          <td>${guest.card_id}</td>
          <td>${guest.address}</td>
          <td>
            <a href="/guests/edit/${guest.id}" id="editBtn">Edit</a>
            <a href="/guests/delete/${guest.id}" onclick="return confirm('Are you sure?')" id="delBtn">Delete</a>
          </td>
        </tr>
      `);
    }
    res.write(`<p id="count">${guests.length} guests</p>`);
    res.write(guestFooter);
    res.end();
  });
});

app.get("/guests/create", (req, res) => {
  res.sendFile(path.join(__dirname, "guests", "create.html"));
});

app.post("/guests/create", (req, res) => {
  let errors = [];
  const { fname, lname, email, card_id, address } = req.body;
  if (!fname && !lname && !email && !card_id && !address) {
    errors.push("All inputs are required.");
  }
  if (fname.length < 3) {
    errors.push("First name must be at least 3 characters.");
  }
  if (lname.length < 3) {
    errors.push("Last name must be at least 3 characters.");
  }
  if (errors.length > 0) {
    res.writeHead(500, {
      "Content-Type": "text/html; charset=utf-8",
    });
    for (let error of errors) {
      res.write(error + "<br />");
    }
    res.end();
  } else {
    let sqlQuery =
      "insert into guests (first_name, last_name, email, card_id, address) values (?, ?, ?, ?, ?)";
    mydb.query(
      sqlQuery,
      [fname, lname, email, card_id, address],
      (err, result) => {
        if (err) {
          console.log("Something wrong because", err);
          res.write("Something wrong");
          res.end();
        }
        console.log("Guest added successfully");
        res.redirect("/guests/show");
      },
    );
  }
});

app.get("/guests/edit/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "guests", "edit.html"));
});

app.post("/guests/edit/:id", (req, res) => {
  let errors = [];
  const { fname, lname, email, card_id, address } = req.body;
  const { id } = req.params;
  if (!fname && !lname && !email && !card_id && !address) {
    errors.push("All inputs are required.");
  }
  if (fname.length < 3) {
    errors.push("First name must be at least 3 characters.");
  }
  if (lname.length < 3) {
    errors.push("Last name must be at least 3 characters.");
  }
  if (errors.length > 0) {
    res.writeHead(500, {
      "Content-Type": "text/html; charset=utf-8",
    });
    for (let error of errors) {
      res.write(error + "<br />");
    }
    res.end();
  } else {
    let sqlQuery =
      "update guests set first_name = ?, last_name = ?, email = ?, card_id = ?, address = ? where id = ?";
    mydb.query(
      sqlQuery,
      [fname, lname, email, card_id, address, id],
      (err, result) => {
        if (err) {
          console.log("Something wrong because", err);
          res.write("Something wrong");
          res.end();
        }
        console.log("Guest updated successfully");
        res.redirect("/guests/show");
      },
    );
  }
});

// Get guests details to fill the edit form
app.get("/api/guests/edit/:id", async (req, res) => {
  const { id } = req.params;

  const [[result]] = await mydb
    .promise()
    .query("select * from guests where id = ?", [id]);
  res.json({
    guest: result,
  });
});

app.get("/guests/delete/:id", (req, res) => {
  const { id } = req.params;
  // Delete guest from database
  const sqlQuery = "delete from guests where id = ?";
  mydb.query(sqlQuery, [id], (err, result) => {
    if (err) {
      console.log("Something wrong because", err);
      res.write("Something wrong");
      res.end();
    }
    console.log("Guest deleted successfully");
    res.redirect("/guests/show");
  });
});
// Guests Routes Ends

// Rooms Routes Starts
app.get("/rooms", (req, res) => {
  res.sendFile(path.join(__dirname, "rooms", "index.html"));
});

app.get("/rooms/show", (req, res) => {
  const { sort, filter } = req.query;
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
  });
  const roomHeader = ` 
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Rooms</title>
        <link rel="stylesheet" href="style.css" />
      </head>
      <body>
        <section class="container">
          <a href="/rooms" id="btn">Back</a>
          <table>
            <tr>
              <th>Number</th>
              <th>Price per night</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
    `;
  const roomFooter = `
        </table>
      </section>
    </body>
  </html>
  `;

  const sqlQuery = "select * from rooms";
  mydb.query(sqlQuery, (err, rooms) => {
    if (err) {
      console.log(`Something Wrong Because: ${err}`);
      res.send("<h1>An unknown error occured!</h1>");
    }
    res.write(roomHeader);
    if (sort) {
      const sortArr = sort.split("-");
      if (sortArr[0] === "price") {
        if (sortArr[1] === "asc") {
          rooms.sort((a, b) => a.price_per_night - b.price_per_night);
        } else if (sortArr[1] === "desc") {
          rooms.sort((a, b) => b.price_per_night - a.price_per_night);
        }
      } else if (sortArr[0] === "number") {
        if (sortArr[1] === "asc") {
          rooms.sort((a, b) => a.number - b.number);
        } else if (sortArr[1] === "desc") {
          rooms.sort((a, b) => b.number - a.number);
        }
      }
    }
    if (filter && filter === "active") {
      rooms = rooms.filter((room) => room.status === filter);
    } else if (filter && filter === "inactive") {
      rooms = rooms.filter((room) => room.status === filter);
    }
    for (let room of rooms) {
      res.write(`
        <tr>
          <td>${room.number}</td>
          <td>${room.price_per_night} MAD</td>
          <td>${room.status}</td>
          <td>
            <a href="/rooms/edit/${room.id}" id="editBtn">Edit</a>
            <a href="/rooms/delete/${room.id}" onclick="return confirm('Are you sure?')" id="delBtn">Delete</a>
          </td>
        </tr>
      `);
    }
    res.write(`
      <div class="dropdown-container">
        <div class="dropdown">
          <button class="dropbtn">Sort</button>
          <div class="dropdown-content">
          <a href="/rooms/show?sort=number-asc">Number ASC</a>
          <a href="/rooms/show?sort=number-desc">Number DESC</a>
          <a href="/rooms/show?sort=price-asc">Price ASC</a>
          <a href="/rooms/show?sort=price-desc">Price DESC</a>
          </div>
        </div>
        <div class="dropdown">
          <button class="dropbtn">Filter</button>
          <div class="dropdown-content">
          <a href="/rooms/show?filter=active">Active</a>
          <a href="/rooms/show?filter=inactive">Inactive</a>
          </div>
        </div>
      </div>
    `);
    res.write(`<p id="count">${rooms.length} rooms</p>`);
    res.write(roomFooter);
    res.end();
  });
});

app.get("/rooms/create", (req, res) => {
  res.sendFile(path.join(__dirname, "/rooms", "create.html"));
});

app.post("/rooms/create", (req, res) => {
  let errors = [];
  const { num, price, status } = req.body;
  if (!num || !price || !status) {
    errors.push("All fields are required.");
  }
  if (!Number.isInteger(parseFloat(num)) || num <= 0) {
    errors.push("Room number must be a positive integer.");
  }
  if (isNaN(price) || parseFloat(price) <= 0) {
    errors.push("Price must be a positive number.");
  }
  if (errors.length > 0) {
    res.writeHead(500, {
      "Content-Type": "text/html; charset=utf-8",
    });
    for (let error of errors) {
      res.write(error + "<br />");
    }
    res.end();
  } else {
    let sqlQuery =
      "insert into rooms (number, price_per_night, status) values (?, ?, ?)";
    mydb.query(sqlQuery, [num, price, status], (err, result) => {
      if (err) {
        console.log("Something wrong because", err);
        res.write("Something wrong");
        res.end();
      }
      console.log("Guest added successfully");
      res.redirect("/rooms/show");
    });
  }
});

app.get("/rooms/edit/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "rooms", "edit.html"));
});

app.post("/rooms/edit/:id", (req, res) => {
  let errors = [];
  const { num, price, status } = req.body;
  const { id } = req.params;
  if (!num || !price || !status) {
    errors.push("All fields are required.");
  }
  if (!Number.isInteger(parseFloat(num)) || num <= 0) {
    errors.push("Room number must be a positive integer.");
  }
  if (isNaN(price) || parseFloat(price) <= 0) {
    errors.push("Price must be a positive number.");
  }
  if (errors.length > 0) {
    res.writeHead(500, {
      "Content-Type": "text/html; charset=utf-8",
    });
    for (let error of errors) {
      res.write(error + "<br />");
    }
    res.end();
  } else {
    let sqlQuery =
      "update rooms set number = ?, price_per_night = ?, status = ? where id = ?";
    mydb.query(sqlQuery, [num, price, status, id], (err, result) => {
      if (err) {
        console.log("Something wrong because", err);
        res.write("Something wrong");
        res.end();
      }
      console.log("Room updated successfully");
      res.redirect("/rooms/show");
    });
  }
});

app.get("/rooms/delete/:id", (req, res) => {
  const { id } = req.params;
  // Delete room from database
  const sqlQuery = "delete from rooms where id = ?";
  mydb.query(sqlQuery, [id], (err, result) => {
    if (err) {
      console.log("Something wrong because", err);
      res.write("Something wrong");
      res.end();
    }
    console.log("Room deleted successfully");
    res.redirect("/rooms/show");
  });
});

// Get rooms details to fill the edit form
app.get("/api/rooms/edit/:id", async (req, res) => {
  const { id } = req.params;

  const [[result]] = await mydb
    .promise()
    .query("select * from rooms where id = ?", [id]);
  res.json({
    room: result,
  });
});
// Rooms Routes Ends

app.listen(port, () => {
  console.log(`Server running at http://www.localhost:${port}`);
});
