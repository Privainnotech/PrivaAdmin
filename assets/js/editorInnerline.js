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


let loadDetail = null
const editor = new EditorJS({
    autofocus: true,
    tools: {
        text: {
            class: SimpleText,
            inlineToolbar: ['link']
        },
        header: {
            class: Header,
            shortcut: 'CMD+SHIFT+H',
            config: {
                placeholder: 'Enter a header',
                levels: [2, 3, 4],
                defaultLevel: 3
            }
        }
    },
    data: loadDetail
});

const saveButton = document.getElementById('save-button');

saveButton.addEventListener('click', () => {
    editor.save().then(savedData => {
        load = JSON.stringify(savedData, null, 4)
        console.log(savedData)

    })
})