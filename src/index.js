import React from "react";
import { createRoot } from 'react-dom/client';
import { useState } from "react";

const root = createRoot(document.getElementById("priorityRoot"))
let data;
let grabData = true;
let formScreenEdit = false;
let updateID = 6;

let tempID = 0;
let tempName = "";
let tempDesc = "";
let tempPriority = null;

function removeItem(id) {
    console.log(id)
    let req = new XMLHttpRequest();
    req.open("DELETE", `http://localhost:8080/removeItem/${id}`, true)
    req.onload = function() {
        grabData = true;
        root.render(<App />)
    }
    req.send();
}

function changePriority(id, status) {
    if (status) {
        let req = new XMLHttpRequest();
        req.open("PATCH", `http://localhost:8080/updateItem/${id}?rawPriority=false`, true)
        req.onload = function() {
            grabData = true;
            root.render(<App />)
        }
        req.send();
    } else {
        let req = new XMLHttpRequest();
        req.open("PATCH", `http://localhost:8080/updateItem/${id}?rawPriority=true`)
        req.onload = function() {
            grabData = true;
            root.render(<App />)
        }
        req.send();
    }
}

const App = () => {
    const [name, setName] = useState(null)
    const [description, setDescription] = useState(null)
    const [priority, setPriority] = useState(false)

    const handleEdit = (event) => {
        event.preventDefault();

        console.log(name + " " + description + " " + priority)
        if (name != null) {
            tempName = name;
        }
        if (description != null) {
            tempDesc = description;
        }
        tempPriority = priority;

        let req = new XMLHttpRequest();
        req.open("PATCH", `http://localhost:8080/updateItem/${tempID}?rawName=${tempName}&rawDesc=${tempDesc}&rawPriority=${tempPriority}`);
        req.onload = function() {
            setName(null);
            setDescription(null);
            setPriority(false);
    
            formScreenEdit = false;
            grabData = true;
            root.render(<App />)
        }
        req.send();
    }

    if (grabData) {
        getData(function(value) {
            console.log(value);
            data = JSON.parse(value);
            grabData = false;
            root.render(<App />);
        });
    }
    
    if (data != null) {
        const listItem = {border: '2px solid black'}
        const insertion = data.Items.map(function(item) {
            if (item["topPriority"] == true) {
                return (
                    <div className="task">
                        <h3>{item["name"]}</h3>
                        <p>{item["desc"]}</p>
                        <div className="buttons">
                            <button onClick={() => showFormEdit(item["id"], item["name"], item["desc"], item["topPriority"])}><img src = "edit.png" width = "40px" height = "40px"/></button>
                            <button onClick={() => removeItem(item["id"])}><img src = "trash.png" width = "40px" height = "40px" /></button>
                        </div>
                        <button className = "priorityButton" onClick = {() => changePriority(item["id"], item["topPriority"])}><img className = "priorityImage" src = "Star.png" width = "35px" height = "35px"/></button>
                    </div>
                );
            }
        });
        const normalInsertion = data.Items.map(function(item) {
            if (item["topPriority"] == false) {
                return (
                    <div className="task">
                        <h3>{item["name"]}</h3>
                        <p>{item["desc"]}</p>
                        <div className="buttons">
                            <button onClick={() => showFormEdit(item["id"], item["name"], item["desc"], item["topPriority"])}><img src = "edit.png" width = "40px" height = "40px"/></button>
                            <button onClick={() => removeItem(item["id"])}><img src = "trash.png" width = "40px" height = "40px" /></button>
                        </div>
                        <button className = "priorityButton" onClick = {() => changePriority(item["id"], item["topPriority"])}><img className = "priorityImage" src = "uncheckedStar.png" width = "35px" height = "35px"/></button>
                    </div>
                );
            }
        });
        if (formScreenEdit) {
            return (
                <div className = "formContainer">
                    <div className="grid-container priority-grid">{insertion}{normalInsertion}</div>
                    <div className="blurCover"></div>
                    <div className = "form">
                        <form className = "editForm" onSubmit={handleEdit}>
                            <label className = "label">
                                Name
                                <br />
                                <input placeholder = {tempName} id = "nameEdit" className = "input-text" type = "text" name = "rawText" onChange={(event) => setName(event.target.value)}></input>
                            </label>
                            <br />
                            <br />
                            <label className = "label">
                                Description
                                <br />
                                <input placeholder = {tempDesc} id = "descEdit" className = "input-text" type = "text" name = "rawDesc" onChange={(event) => setDescription(event.target.value)}></input>
                            </label>
                            <br />
                            <br />
                            <label className = "label">
                                Top Priority
                                <br />
                                <input checked = {tempPriority} id = "priorityEdit" className = "input-check" type = "checkbox" name = "rawPriority" onChange = {function(event) {setPriority(event.target.checked); tempPriority = event.target.checked; root.render(<App />)}}></input>
                            </label>
                            <br />  
                            <br />
                            <br />
                            <input type = "submit" className = "input-submit"></input>
                        </form>
                    </div>
                </div>
            );
        }
        return <div className="grid-container priority-grid">{insertion}{normalInsertion}</div>;
    } else {
        return <h1>An Error Occured</h1>
    }
}

function showFormEdit(id, name, desc, priority) {
    formScreenEdit = true;
    tempName = name;
    tempID = id;
    tempDesc = desc;
    tempPriority = priority;
    root.render(<App />)
}

function getData(callback) {
    let req = new XMLHttpRequest();
    req.open("GET", "http://localhost:8080/getItems", true);
    req.onload = function() {
        callback(req.responseText);
    }
    req.send();
}

root.render(<App />);