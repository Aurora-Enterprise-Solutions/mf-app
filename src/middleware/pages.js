function findViewByName(views, name) {

    if (!views)
        return false

    for (const view of views) {

        if (view.name === name) {

            return true

        }
        else if (view.children) {

            const result = findViewByName(view.children, name)

            if (result)
                return true

        }

    }

    return false

}

function hasUserAccessToPage(page, user) {

    return findViewByName(user.views, page)

}

export default function(context) {

    if (!context.$auth.loggedIn)
        return

    if (hasUserAccessToPage(context.route.name, context.$auth.user) )
        return

    context.app.router.push( { name: context.$auth.user.role.initialView } )

}
