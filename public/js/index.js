$(document).ready(() => {

    $('#editNote').on('submit', () => {
        let uuid = $(this).uuid.text()
        $.ajax({
            type: 'DELETE',
            url: `/notes/${uuid}`,
            success: (data) => {
                location.reload()
            }
        })
    })
})