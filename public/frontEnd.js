let workoutForm = document.querySelector('#newWorkout')
let table = document.querySelector('#table-body')
let formContainer = document.querySelector('.form-container')

// Set Date to formate date selector for today
let date = new Date()
let day = date.getDate()
let month = date.getMonth() + 1
let year = date.getFullYear()
if (month < 10) month = "0" + month
if (day < 10) day = "0" + day

let today = `${year}-${month}-${day}`

let dateSelector = document.querySelector('#date')
dateSelector.value = today


// Listen for new workout being added
workoutForm.addEventListener("submit", (e) => addWorkout(e))

const addWorkout = async (e) => {
    // add workout to mysql database using fetch request, then add that workout to the table
    e.preventDefault()

    let form = e.currentTarget
    data = new FormData(form)
    const url = form.action

    try {
        const response = await postResponse({url, data})
        appendWorkout(response)
        form.reset()
    }
    catch(err) { console.log(err)}
    
}

const postResponse = async ({url, data}) => {
    // POST request using fetch
    const formData = Object.fromEntries(data.entries())
    const jsonString = JSON.stringify(formData)

    const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Accept: "application/json"},
        body: jsonString
    })

    return response.json()
}

const getData = async () => {
    // called when page first loads to pull in data from database
    let response = await fetch('/get-data')
    response = await (response.json())
    response[0].forEach(workout => {
        appendWorkout(workout)
    });    
}

const appendWorkout = (workout) => {
    // add a workout to the table --> workout should be an object containing all the info necessary for the table
    if (workout.lbs == 1) {
        workout.lbs = "lbs"
    } else {
        workout.lbs = "kg"
    }
    let input = document.createElement('tr') 
    input.innerHTML = 
    `
        <td>${workout.name}</td>
        <td>${workout.reps}</td>
        <td>${workout.weight}</td>
        <td>${workout.date}</td>
        <td id=${workout.id}>${workout.lbs} <a href="#top"><i class="fas fa-edit"></i></a> <i class="fas fa-trash-alt"></i></td>
    `

    table.appendChild(input)
}

const removeWorkout = (id) =>{
    // iterates over the table and removes the table row once found, probably should have just passed this function the row... oh well
    for (item of table.children) {
        if (item.children[4].id == id){
            table.removeChild(item)
        }
    }
}

const edit = (name, reps, weight, date, unit, id, row) => {
    // takes all the important info and uses it to change the new workout form to be an edit workout form, and populates 
    // the values to the values already in that query. Calls saveChanges() to save the changes from the form submit and update the table
    id = Number(id)
    let month = date.textContent.slice(0,2)
    let day = date.textContent.slice(3,5)
    let year = date.textContent.slice(6,10)
    
    date.value = year + '-' + month + '-' + day

    let selector = ''
    
    if (unit.textContent == 'lbs  ') {
        selector = `<td><input class="" type="radio" name="units" id="lbs" value="lbs" checked="checked">
                            <label for="lbs">lbs</label>
                            <input class="" type="radio" name="units" id="kg" value="kg">
                            <label for="kg">kg</label>
                        </td>
                    `
    } else {
        selector =`<td>
            <input class="" type="radio" name="units" id="lbs" value="lbs">
            <label for="lbs">lbs</label>
            <input class="" type="radio" name="units" id="kg" value="kg" checked="checked">
            <label for="kg">kg</label>
        </td>
    `
    }

    let h2 = document.querySelector('h2')

    h2.textContent = "Edit Your Workout Plan"

    formContainer.innerHTML = `
    <form id="editWorkout" action="/update" method="POST">
    <label class="label" for="name"> Enter Workout Name:
        <input class="input" type="text" name="name" id="name" value="${name.textContent}" required>
    </label>

    <label class="label" for="reps">Number of Reps:
        <input class="input" type="number" name="reps" id="reps" value="${reps.textContent}">
    </label>

    <label class="label" for="weight">Weight:
        <input class="input" type="number" name="weight" id="weight" value="${weight.textContent}">
    </label>

    <label class="label" for="date">Date:
        <input class="input" type="date" name="date" id="date" value="${date.value}">
    </label>

    ${selector}
    <br><br>
    <input type="hidden" name="id" value="${id}">
    <button type="submit"  class="btn-secondary">Update Workout</button>

    <br><br>
</form>
    `
    let updateForm = document.querySelector('#editWorkout')
    updateForm.addEventListener('submit', (e) => saveChanges(e, row))
    h2.textContent = "Enter New Workout Plan:"

}

const saveChanges = async (e, row) => {
    e.preventDefault()

    let form = e.currentTarget
    data = new FormData(form)
    const url = form.action

    try {
        const response = await putResponse({url, data})
        changeWorkoutRow(response, row)
        workoutForm = document.querySelector('#newWorkout')
        workoutForm.addEventListener("submit", (e) => addWorkout(e))
    }
    catch(err) { console.log(err)}

}

const putResponse = async ({url, data}) => {
    const formData = Object.fromEntries(data.entries())
    const jsonString = JSON.stringify(formData)

    const response = await fetch(url, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json', Accept: "application/json"},
        body: jsonString
    })

    return response.json()
}

const changeWorkoutRow = (data, row) => {

    let month = data.date.slice(5,7)
    let day = data.date.slice(8,10)
    let year = data.date.slice(0,4)

    let date2 = data.date

    data.date = month + "/" + day + "/" + year

    if (data.units == true) {
        data.units = "lbs"
    } else {
        data.units = "kg"
    }

    row.innerHTML = `
    <td>${data.name}</td>
    <td>${data.reps}</td>
    <td>${data.weight}</td>
    <td>${data.date}</td>
    <td id=${data.id}>${data.units} <a href="#top"><i class="fas fa-edit"></i></a> <i class="fas fa-trash-alt"></i></td>
`

formContainer.innerHTML = `
<form id="newWorkout" action="/" method="POST">
<label class="label" for="name"> Enter Workout Name:
    <input class="input" type="text" name="name" id="name" required>
</label>

<label class="label" for="reps">Number of Reps:
    <input class="input" type="number" name="reps" id="reps" >
</label>

<label class="label" for="weight">Weight:
    <input class="input" type="number" name="weight" id="weight">
</label>

<label class="label" for="date">Date:
    <input class="input" type="date" name="date" id="date" value="${today}">
</label>

<label class="" for="units">Units:
    <input class="" type="radio" name="units" value="lbs" checked="checked">
    <label for="lbs">lbs</label>
    <input class="" type="radio" name="units" value="kg">
    <label for="kg">kg</label>
</label>
<br><br>
<button type="submit" class="btn-primary">Add Workout</button>

<br><br>
</form>
    `

}

const deleteOrEdit = (e) => {
    if (e.target.classList.contains('fa-trash-alt')) {
        fetch(`/delete/${e.target.parentElement.id}`, {method: "DELETE"})
        .then(() => removeWorkout(e.target.parentElement.id))
    } else if (e.target.classList.contains('fa-edit')) {
        let unit = e.target.parentElement.parentElement
        let date = unit.previousSibling.previousSibling
        let weight = date.previousSibling.previousSibling
        let reps = weight.previousSibling.previousSibling
        let name = reps.previousSibling.previousSibling
        let row = unit.parentElement

        edit(name, reps, weight, date, unit, unit.id, row)
    }
}

table.addEventListener('click', deleteOrEdit)

window.onload = getData
