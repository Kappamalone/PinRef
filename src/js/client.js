//TODO: Add a loading icon until response is sent
const input = document.getElementById('input'); //The input field
const removable = document.getElementById('removable'); //All the initial elements to be removed for canvas
const error = document.getElementById('error'); //Error popup

function validateURLInput(input) {
    return input.includes('https://www.pinterest.com/');
}

async function fetchURL(value) {
    let success = false;
    let request = await fetch('/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input.value }),
    });

    let response = await request.json();
    links = response['links'];

    if (links.length > 0) {
        success = true;
    }

    //If successful, then prepare canvas
    return success;
}

//Starts all p5 processes, loads images, and resizes canvas
function startup() {
    started = true;
    resizeCanvas(windowWidth, windowHeight);

    for (let i = 0; i < links.length; i++) {
        load_image(links[i], 0, 0);
    }

    //Let images load, then sort them based on their width and cascade them across screen
    setTimeout(() => {
        drawItems.sort((a, b) => {
            if (a.originalWidth > b.originalWidth) return 1;
            if (a.originalWidth < b.originalWidth) return -1;
            return 0;
        });

        for (let i = 0; i < drawItems.length; i++) {
            drawItems[i].x = i * 100;
            drawItems[i].xr = drawItems[i].x + drawItems[i].originalWidth;
        }
    }, 50);
}

input.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        if (!validateURLInput(input.value)) {
            //POST pinterest board url to recieve image urls back
            fetchURL(input.value)
                .then((success) => {
                    if (success) {
                        //If successful, transition to canvas
                        removable.remove();
                        startup();
                    } else {
                        //Else, display error
                        error.style.visibility = 'visible';
                    }
                })
                .catch((e) => {
                    console.log('Error occured: ' + e);
                });
        }
    }
});
