import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from 'react-email';

interface ResetPasswordEmailProps {
  resetLink: string;
  labels: {
    subject: string;
    greeting: string;
    message: string;
    button: string;
    ignore: string;
  };
  dir?: 'ltr' | 'rtl';
}

export default function ResetPasswordEmail({
  resetLink,
  labels,
  dir = 'ltr',
}: ResetPasswordEmailProps) {
  return (
    <Html dir={dir}>
      <Head />
      <Preview>{labels.subject}</Preview>
      <Tailwind>
        <Body className="bg-[#fdfdfc] font-sans text-[#0f172a]">
          <Container className="mx-auto my-10 max-w-150 border border-[#e2e8f0] rounded-xl p-5 bg-white">
            <Heading className="text-[24px] font-bold text-center text-[#006b7d] mb-6">
              Waypoint
            </Heading>
            <Section className="mb-6">
              <Text className="text-[16px] leading-6">{labels.greeting},</Text>
              <Text className="text-[16px] leading-6">{labels.message}</Text>
            </Section>
            <Section className="text-center mb-8">
              <Link
                href={resetLink}
                className="bg-[#006b7d] text-white font-bold text-[16px] px-6 py-3 rounded-lg no-underline inline-block"
              >
                {labels.button}
              </Link>
            </Section>
            <Text className="text-[14px] text-[#64748b]">{labels.ignore}</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
