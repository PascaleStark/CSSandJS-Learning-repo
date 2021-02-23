'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//Display all movements of a user: Logic: pass the movements array, loop over it and label all positive values as deposit, all negative values as withdrawal, then display the html element.
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">3 days ago</div>
    <div class="movements__value">${mov}€</div>
  </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html); //appended:newer first
  });
};

//Display account summary: Logic: we will call the function using also the movements array of an account object. We will loop over that array and add all its values --> output one single value means reduce. Then we will display it in the right place in the UI using textSelector

const calcCurrentBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance} €`;
};

//Display all summary data at: in out int: Logic: we will call a function that also accepts the array movements of an account object. We will loop over it and 1. choose only positive values, add them up and display them in IN (so, forEach with condition then reduce to add the values) 2. choose only negative values and add them up to display the out 3. choose the
const calcSummaryBalance = function (acc) {
  //IN
  const inBalance = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = inBalance;

  //OUT
  const outBalance = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + Math.abs(mov), 0);
  labelSumOut.textContent = outBalance;

  //INT
  const intBalance = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  // console.log(intBalance);
  labelSumInterest.textContent = intBalance;
};

//Add the username property to all accounts using initials of the owner
const AddUsername = function (acc) {
  acc.forEach(function (user) {
    //we are not creating a new array but making a side effect that mutates the objects
    const catchInitials = user.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
    // console.log(catchInitials);
    user.username = catchInitials; //instead we can replace const catchInitials by user.username
  });
};
AddUsername(accounts);
// console.log(accounts);

//Function transaction calculations
const displayUpdatedTransactions = function (acc) {
  displayMovements(acc.movements);
  calcCurrentBalance(acc);
  calcSummaryBalance(acc);
};

//Event Handlers

//SORT Event Handler
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentUser.movements, !sorted);
  sorted = !sorted;
});

//LOGIN EVENT HANDLER
let currentUser;
//Add Event Listeners
btnLogin.addEventListener('click', function (e) {
  //Preventing reload on click or prevent form from submitting
  e.preventDefault();

  currentUser = accounts.find(acc => acc.username === inputLoginUsername.value); //returns undefined if user not found
  //check credentials
  if (currentUser?.pin && currentUser.pin === Number(inputLoginPin.value)) {
    //display welcome message and UI
    labelWelcome.textContent = `Welcome ${currentUser.owner}!`;
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    containerApp.style.opacity = 1;
    //display movements

    displayUpdatedTransactions(currentUser);
  } else {
    alert('user not found');
  }
});

//TRANSFER EVENT HANDLER
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  //check if transferTo user exists
  const transferToUser = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  const amount = Number(inputTransferAmount.value);

  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    transferToUser &&
    transferToUser.username !== currentUser.username &&
    amount > 0 &&
    amount <= currentUser.balance
  ) {
    //Add -amount to sender(currentUser)

    currentUser.movements.push(-amount);
    transferToUser.movements.push(amount);

    displayUpdatedTransactions(currentUser);
  }
});

//Request a loan Event Handler
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentUser.movements.some(mov => mov >= amount * 0.1)) {
    //Add loan amount to the movements array
    currentUser.movements.push(amount);
    //Update UI
    displayUpdatedTransactions(currentUser);
  }
  inputLoanAmount.value = '';
});

//CloseAccount Event Handler
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentUser.username &&
    Number(inputClosePin.value) === currentUser.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentUser.username
    );

    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }

  inputClosePin.value = inputCloseUsername.value = '';
});
//////////////////////////////////////////////
//LECTURES;
//Application of flat and flatMap

// const allAccoutsMovements = accounts.map(acc => acc.movements);
// console.log(allAccoutsMovements);
// const flatAll = allAccoutsMovements.flat();
// console.log(flatAll);
// const totalAmount = flatAll.reduce((acc, mov) => acc + mov, 0);
// console.log(totalAmount);

// const totalAmount2 = accounts
//   .map(acc => acc.movements)
//   .flat()
//   .reduce((acc, mov) => acc + mov, 0);
// console.log(totalAmount2);

//Create new arrays and fill them programmatically
//so far we have created arrays manually
// const arr = [1, 2, 3, 4, 5, 6, 7];
// console.log(arr);
// console.log([1, 2, 3, 4, 5, 6, 7]);

// //To create a new array
// const arr2 = new Array(1, 2, 3, 4, 5, 6, 7);
// console.log(arr2);

// //To create an empty array with n elements
// const arr3 = new Array(7);
// console.log(arr3);
// //To fill it
// arr3.fill(1);
// console.log(arr3);
// arr3.fill(1, 0);
// console.log(arr3);
// arr3.fill(2, 1, 2);
// arr3.fill(3, 2, 3);
// arr3.fill(4, 3, 4);
// arr3.fill(5, 4, 5);
// arr3.fill(6, 5, 6);
// arr3.fill(7, 6, 7);
// console.log(arr3);

// //Using Array.from() function
// //To create a new array
// const copyArr = Array.from({ length: 7 }, (_, i) => i + 1);
// console.log(copyArr);

// //To create a new array form a nodeList

// //EventHanler to avoid reload
// labelBalance.addEventListener('click', function () {
//   const arrFromNode = Array.from(
//     document.querySelectorAll('.movements__value'),
//     curr => Number(curr.textContent.replace('€', ''))
//   );
//   console.log(arrFromNode);
// });

// //Another way
// const arrFromNode2 = [...document.querySelectorAll('.movements__value')];
// console.log(arrFromNode2);
