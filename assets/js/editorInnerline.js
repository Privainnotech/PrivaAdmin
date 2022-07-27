class SimpleText {
    constructor({ data }) {
        this.data = data;
        this.wrapper = undefined;
    }

    save(blockContent) {
        const image = blockContent.querySelector('img');
        const caption = blockContent.querySelector('input');

        return {
            url: image.src,
            caption: caption.value
        }
    }

    validate(savedData) {
        if (!savedData.url.trim()) {
            return false;
        }

        return true;
    }
}



const saveButton = document.getElementById('save-button');

saveButton.addEventListener('click', () => {
    editor.save().then(savedData => {
        load = JSON.stringify(savedData, null, 4)
        console.log(savedData)

    })
})