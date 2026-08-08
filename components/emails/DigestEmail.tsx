import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from 'react-email';

interface TripSummary {
  id: string;
  name: string;
  expensesCount: number;
  pollsCount: number;
  placesCount: number;
}

interface DigestEmailProps {
  userName: string;
  trips: TripSummary[];
  appUrl: string;
  locale: string;
  labels: {
    subject: string;
    title: string;
    greeting: string;
    intro: string;
    newExpenses: string;
    newPolls: string;
    newPlaces: string;
    viewTrip: string;
    ignore: string;
  };
  dir?: 'ltr' | 'rtl';
}

export default function DigestEmail({
  userName,
  trips,
  appUrl,
  locale,
  labels,
  dir = 'ltr',
}: DigestEmailProps) {
  return (
    <Html dir={dir}>
      <Head />
      <Preview>{labels.subject}</Preview>
      <Tailwind>
        <Body className="bg-[#fdfdfc] font-sans text-[#0f172a]">
          <Container className="mx-auto my-10 max-w-150 border border-[#e2e8f0] rounded-xl p-5 bg-white">
            <Heading className="text-[24px] font-bold text-center text-[#006b7d] mb-6">
              {labels.title}
            </Heading>
            <Section className="mb-6">
              <Text className="text-[16px] leading-6 font-bold">
                {labels.greeting} {userName},
              </Text>
              <Text className="text-[16px] leading-6">{labels.intro}</Text>
            </Section>

            {trips.map(trip => (
              <Section
                key={trip.id}
                className="mb-6 p-4 bg-[#f1f5f9] rounded-lg"
              >
                <Heading
                  as="h3"
                  className="text-[18px] font-semibold mt-0 mb-3 text-[#0f172a]"
                >
                  {trip.name}
                </Heading>
                <ul className="m-0 p-0 list-none">
                  {trip.expensesCount > 0 && (
                    <li className="text-[14px] mb-1">
                      💰{' '}
                      {labels.newExpenses.replace(
                        '{count}',
                        trip.expensesCount.toString(),
                      )}
                    </li>
                  )}
                  {trip.pollsCount > 0 && (
                    <li className="text-[14px] mb-1">
                      📊{' '}
                      {labels.newPolls.replace(
                        '{count}',
                        trip.pollsCount.toString(),
                      )}
                    </li>
                  )}
                  {trip.placesCount > 0 && (
                    <li className="text-[14px] mb-3">
                      🗺️{' '}
                      {labels.newPlaces.replace(
                        '{count}',
                        trip.placesCount.toString(),
                      )}
                    </li>
                  )}
                </ul>
                <Link
                  href={`${appUrl}/${locale}/trips/${trip.id}`}
                  className="text-[#006b7d] font-bold text-[14px] underline"
                >
                  {labels.viewTrip} {dir === 'rtl' ? '←' : '→'}
                </Link>
              </Section>
            ))}

            <Hr className="border-[#e2e8f0] my-6" />
            <Text className="text-[12px] text-[#64748b] text-center">
              {labels.ignore}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
