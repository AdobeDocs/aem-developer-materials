Datasource
==========

.. granite:servercomponent:: /libs/granite/ui/components/coral/foundation/authorizable/datasource
   :datasource:

   A datasource providing authorizables. Each resource of this datasource is adaptable to ``Authorizable``.

   It has the following content structure:

   .. gnd:gnd::

      [granite:AuthorizableDatasource]

      /**
       * The query to filter principal name, names, email, etc.
       */
      - query (StringEL)

      /**
       * The offset of the query.
       */
      - offset (LongEL) = '0'

      /**
       * The limit of the query.
       */
      - limit (LongEL) = '20'

      /**
       * The selector of authorizable:
       *
       * all
       *    Show all authorizables
       * user
       *    Show only users
       * group
       *    Show only groups
       */
      - selector (StringEL) = 'all' < 'all', 'user', 'group'

      /**
       * Filter for service user:
       *
       * off
       *    Turn off the filter to show all users
       * includeonly
       *    Include only the service users
       * exclude
       *    Exclude the service users
       */
      - serviceUserFilter (String) = 'exclude' < 'off', 'includeonly', 'exclude'

      /**
       * Filter for impersonable user:
       *
       * off
       *    Turn off the filter to show all users
       * includeonly
       *    Include only the users that can be impersonated by the current user
       * exclude
       *    Exclude the users that can be impersonated by the current user
       */
      - impersonableUserFilter (String) = 'off' < 'off', 'includeonly', 'exclude'
