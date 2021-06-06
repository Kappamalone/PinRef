let success = false; 

function validateURLInput(input) {
    return input.includes("https://www.pinterest.com/") 
}

//TODO: Add a loading icon until response is sent
const input = document.getElementById("input");
input.addEventListener("keyup", function(event) {
    if (event.key === "Enter") { 
        if (validateURLInput(input.value)) {
            //POST pinterest board url to recieve image urls back
            fetch("/scraper", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "url": input.value })
            })
            .then(response => response.json())
            .then(data => {
                links = data["links"]
                if (links.length == 0) {
                    //Incorrect Board URL/Empty board
                    console.log("Error"); //TODO: Have a popup to visually show this
                    success = false;
                } else {
                    //Images links successfully recieved
                    console.log("Success!");
                    success = true;
                }

                if (success) {
                    let node = document.getElementById("removable");
                    node.remove();
                    startup();
                }
            })
            .catch((error) => {
                console.error("Error: ",error);
            })
        }
    }
});

//Starts all p5 processes, loads images, and resizes canvas
function startup(){
    started = true;
    resizeCanvas(windowWidth, windowHeight);
    
    for (let i = 0; i < links.length; i++){
        load_image(links[i],0,0);
    }

    //Let images load, then sort them based on their width and cascade them across screen
    setTimeout(() => {
        drawItems.sort((a,b) => {
            if (a.originalWidth > b.originalWidth) return 1;
            if (a.originalWidth < b.originalWidth) return -1;
            return 0;
        })

        for (let i = 0; i < drawItems.length; i++){
            drawItems[i].x = i * 100;
            drawItems[i].xr = drawItems[i].x + drawItems[i].originalWidth;
        }
        
    }, 50);
}