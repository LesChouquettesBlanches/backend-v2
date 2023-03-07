function adminNotice(notice) {
  if (notice !== undefined && notice !== null && notice !== '') {
    return `<p style="font-size:1.5rem"><strong style="color:red">MESSAGE À L'ATTENTION DE L'ADMINISTRATEUR :</strong><br />
		${notice}
	</p>`
  }
  return ''
}

const newOrder = (data) =>
  `
		<div>
			<h1 style="font-size:1rem">Nouvelle commande de ${data.booker.user.firstname} ${
    data.booker.user.lastname
  } pour la société ${data.booker.company}</h1>
			<p style="font-size:1.5rem">
				Le <strong>${data.eventDate}</strong> au <strong>${data.eventLocation}</strong> 
			</p>
			${adminNotice(data.adminNotice)}
			<p>
					Pour voir la commande, cliquez sur le lien suivant :
					<a href="${data.url}">Voir la commande</a>
					<br />
					🤗 🤗 🤗 🤗 🤗 🤗
			</p>
		</div>
	`
module.exports = newOrder
