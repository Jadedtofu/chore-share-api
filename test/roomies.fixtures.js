function makeRoomiesArray() {
    return[
        {
            id: 1,
            name: 'Jorge Santana',
            note: 'Transfer student, rooming for 1 year.'
        },
        {
            id: 2,
            name: 'Tsuzuki Murakami',
            note: 'Transfer student, rooming for 2 years. Likes computers.'

        }
    ];
}

function makeBadRoomie() {
  const badRoomie = {
      id: 911,
      name: `Bad Roomie Script Here <script>alert("xss");</script>`,
      note: `Bad image stuff <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad`
  }

  const expectedRoomie = {
      ...badRoomie,
      name: `Bad Roomie Script Here &lt;script&gt;alert(\"xss\");&lt;/script&gt;`,
      note: `Bad image stuff <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }

  return {
      badRoomie,
      expectedRoomie,
  }
}

module.exports = {
    makeRoomiesArray,
    makeBadRoomie
}