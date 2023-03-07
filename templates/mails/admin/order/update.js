import dateFormat from 'date-fns/format'
import { formatEventClothes, formatTeam } from '../../../../utils/utils'

function adminNotice(notice) {
  if (notice !== undefined && notice !== null && notice !== '') {
    return `<p style="font-size:1.5rem"><strong style="color:red">MESSAGE À L'ATTENTION DE L'ADMINISTRATEUR :</strong><br />
		${notice}
	</p>`
  }
  return ''
}

function translateField(field) {
  let translation
  switch (field) {
    case 'eventLocation':
      translation = 'Nom du lieu'
      break
    case 'eventAddress':
      translation = 'Entrée du personnel'
      break
    case 'eventOrderNumber':
      translation = "Réf. de l'affaire"
      break
    case 'eventDate':
      translation = "Date de l'évènement"
      break
    case 'eventStatus':
      translation = "Statut de l'évènement"
      break
    case 'eventType':
      translation = "Type d'évènement"
      break
    case 'customerName':
      translation = 'Nom du client'
      break
    case 'guestsCount':
      translation = 'Nombre de PAX'
      break
    case 'eventNotice':
      translation = 'Informations supplémentaires'
      break
    case 'adminNotice':
      translation = "Message à l'administration"
      break
    case 'clothes':
      translation = 'Complément de tenue'
      break
    case 'teams':
      translation = 'Modification du personnel(s)'
      break
    case 'newMember':
      translation = 'Nouveau(x) personnel(s)'
      break
    default:
      break
  }
  return translation
}

function formatValue(field, value) {
  let format
  switch (field) {
    case 'eventDate':
      format = dateFormat(new Date(value), 'dd/MM/yyyy')
      break
    case 'eventStatus':
      if (field === null) format = 'En attente'
      if (field) format = 'Validé'
      if (!field) format = 'Option'
      break
    case 'clothes':
      format = formatEventClothes(value)
      break
    case 'teams':
    case 'newMember':
      format = formatTeam(value)
      break
    default:
      format = value
      break
  }
  return format
}

function formatItem(item) {
  let format
  if (item.field === 'newMember') {
    format = `<li>${translateField(item.field)} - ${formatValue(
      item.field,
      item.member,
    )} </li>`
  } else {
    format = `<li>${translateField(
      item.field,
    )} -  <strong>Avant</strong> : ${formatValue(
      item.field,
      item.from,
    )} - <span style="color:red"><strong>Après</strong> : ${formatValue(
      item.field,
      item.to,
    )}</span></li>`
  }
  return format
}

const updateOrder = (data) =>
  `
		<div>
			<h1 style="font-size:1rem">La commande de ${data.booker.user.firstname}  ${
    data.booker.user.lastname
  }pour ${data.booker.company} au ${data.eventLocation} du ${
    data.eventDate
  } a été modifié</h1>
            <ul style="font-size:1.5rem">
                ${data.fieldsUpdated.map((item) => formatItem(item))}
            </ul>
            ${adminNotice(data.adminNotice)}
			<p>
					Pour voir la commande, cliquez sur le lien suivant :
					<a href="${data.url}">Voir la commande</a>
					<br />
					🤗 🤗 🤗 🤗 🤗 🤗
			</p>
		</div>
	`
export default updateOrder
