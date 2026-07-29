import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ApiError } from "@/lib/api-client";
import { profileClient, PublicProfileView } from "@/features/profile";

/**
 * Doc 06 Sec 5.1 lists this route as `/u/{username}`, SSR, public
 * (FR-PROFILE-002). The `Account`/`UserProfile` schema in
 * contracts/openapi.yaml has no `username` field, though -- only `id` and
 * `email` -- and the only matching backend operation is `GET /users/{id}`.
 * This route is therefore `/u/[id]`, keyed on the account id, until the
 * contract/design doc are reconciled on an actual username field. See
 * `features/profile/lib/profile-client.ts` for the same note.
 */
export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  try {
    const profile = await profileClient.getPublicProfile(id);
    return (
      <main>
        <PublicProfileView profile={profile} />
      </main>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
