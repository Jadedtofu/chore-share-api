function makeChoresArray() {
    return[
        {
            id: 1, 
            chore: 'Clean the bathroom',
            checked: false,
            roomie_id: 1
        },
        {
            id: 2, 
            chore: 'Fold the laundry',
            checked: false,
            roomie_id: 1
        },
        {
            id: 3, 
            chore: 'Wash the dishes',
            checked: false,
            roomie_id: 2
        },
        {
            id: 4, 
            chore: 'Take out the trash',
            checked: false,
            roomie_id: 2
        }
    ];
}

function makeChoresNoId() {
    return[
        {
            chore: 'Shine the chrome on sinks',
            checked: false,
            roomie_id: 1
        },
        {
            chore: 'Clean the bathtub',
            checked: false,
            roomie_id: 1
        },
        {
            chore: 'Hang the laundry',
            checked: false,
            roomie_id: 2
        },
        {
            chore: 'Sweep the floor',
            checked: false,
            roomie_id: 2
        }
    ];
}

function makeBadChore() {
    const badChore = {
        id: 119,
        chore: `Bad Chore Script <script>alert("xss");</script>`,
        checked: false,
        roomie_id: 9999,
    }

    const expectedChore = {
        ...badChore,
        chore: `Bad Chore Script &lt;script&gt;alert(\"xss\");&lt;/script&gt;`,
        checked: false,
        roomie_id: 9999
    }

    return {
        badChore,
        expectedChore,
    }
}

module.exports = {
    makeChoresArray,
    makeChoresNoId,
    makeBadChore
}