var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (curr) {
      sum = sum + curr.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      inc: [],
      exp: [],
    },
    totals: {
      inc: 0,
      exp: 0,
    },
    Budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, desc, val) {
      var newItem, ID;
      // create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // create new Item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, desc, val);
      } else if (type === "inc") {
        newItem = new Income(ID, desc, val);
      }

      // Push it into our data structure
      data.allItems[type].push(newItem);

      // return the new element
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;

      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      //1. calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      //2. calculate the budget: total income -  total expenses
      data.budget = data.totals.inc - data.totals.exp;
      //3. calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (curr) {
        curr.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allpercentages = data.allItems.exp.map(function (curr) {
        return curr.getPercentage();
      });
      return allpercentages;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: function () {
      return data;
    },
  };
})();

var UIController = (function () {
  DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPerLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  var formatNumber = function (num, type) {
    var numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");
    int = numSplit[0];
    dec = numSplit[1];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      // Create HTML strings with Placeholder text
      var html, newHtml, element;

      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace the Placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();
      // return fieldsArr, fields;
    },

    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(DOMstrings.expensesLabel).textContent =
        formatNumber(obj.totalExp, "exp");
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPerLabel);

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: function () {
      var todayDate, year, month;
      todayDate = new Date();
      months = [
        "January",
        "Febuary",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      month = todayDate.getMonth();
      year = todayDate.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    getDOMstrings: function () {
      return DOMstrings;
    },

    changedType: function () {
      var fields;
      fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );

      nodeListForEach(fields, function (curr) {
        curr.classList.toggle("red-focus");
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },
  };
})();

var controller = (function (budgetctrl, UIctrl) {
  var setupEventListeners = function () {
    var DOM = UIctrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UIctrl.changedType);
  };

  var updateBudget = function () {
    //6. Calculate the budget
    budgetctrl.calculateBudget();
    //7. Return the Budget
    var budget = budgetctrl.getBudget();
    //8. Display the budget on the UI
    UIctrl.displayBudget(budget);
    // console.log(budget);
  };

  var updatePercentages = function () {
    //1. calculate the percentages
    budgetctrl.calculatePercentages();

    //2. Return the precentage
    var percentages = budgetctrl.getPercentages();

    //3. update the UI with the new percentages
    UIctrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function () {
    var input, newItem;
    //1. Get the field input data
    input = UIctrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. Add the item to the budget Controller
      newItem = budgetctrl.addItem(input.type, input.description, input.value);

      //3. Add the item to the UI
      UIctrl.addListItem(newItem, input.type);

      //4. clear the fields.
      UIctrl.clearFields();

      //5. calculate and update Budget
      updateBudget();

      //6.calculate and update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1. delete the item from the data structure
      budgetctrl.deleteItem(type, ID);

      //2. delete the item from the UI
      UIctrl.deleteListItem(itemID);

      //3.update and show new budget
      updateBudget();

      //4. //6.calculate and update percentages
      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log("Application has started.");
      setupEventListeners();
      UIctrl.displayMonth();
      UIController.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
    },
  };
})(budgetController, UIController);

controller.init();
